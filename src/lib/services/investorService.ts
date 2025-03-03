import { supabase } from "../supabase";
import { Investor } from "@/components/dashboard/InvestorGrid";
import { InvestorGroup } from "@/components/dashboard/InvestorGroups";
import { sampleInvestors, sampleGroups } from "../sampleData";

// Investor CRUD operations
export const fetchInvestors = async (): Promise<Investor[]> => {
  try {
    const { data, error } = await supabase
      .from("investors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching investors:", error);
      // Fall back to sample data if there's an error
      return sampleInvestors;
    }

    if (!data || data.length === 0) {
      // If no data in the database, seed with sample data
      await seedSampleData();
      return sampleInvestors;
    }

    return data.map((investor) => ({
      id: investor.id,
      name: investor.name,
      email: investor.email,
      type: investor.type,
      walletAddress: investor.wallet_address,
      kycStatus: investor.kyc_status as Investor["kycStatus"],
      lastUpdated: investor.last_updated,
    }));
  } catch (error) {
    console.error("Error in fetchInvestors:", error);
    // Return sample data as fallback
    return sampleInvestors;
  }
};

export const createInvestor = async (
  investor: Omit<Investor, "id">,
): Promise<Investor> => {
  const { data, error } = await supabase
    .from("investors")
    .insert({
      name: investor.name,
      email: investor.email,
      type: investor.type,
      wallet_address: investor.walletAddress,
      kyc_status: investor.kycStatus,
      last_updated: investor.lastUpdated,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating investor:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    type: data.type,
    walletAddress: data.wallet_address,
    kycStatus: data.kyc_status as Investor["kycStatus"],
    lastUpdated: data.last_updated,
  };
};

export const updateInvestor = async (
  id: string,
  updates: Partial<Investor>,
): Promise<void> => {
  const { error } = await supabase
    .from("investors")
    .update({
      name: updates.name,
      email: updates.email,
      type: updates.type,
      wallet_address: updates.walletAddress,
      kyc_status: updates.kycStatus,
      last_updated:
        updates.lastUpdated || new Date().toISOString().split("T")[0],
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating investor:", error);
    throw error;
  }
};

export const deleteInvestor = async (id: string): Promise<void> => {
  const { error } = await supabase.from("investors").delete().eq("id", id);

  if (error) {
    console.error("Error deleting investor:", error);
    throw error;
  }
};

export const bulkCreateInvestors = async (
  investors: Omit<Investor, "id">[],
): Promise<void> => {
  try {
    const { error } = await supabase.from("investors").insert(
      investors.map((investor) => ({
        name: investor.name,
        email: investor.email,
        type: investor.type,
        wallet_address: investor.walletAddress,
        kyc_status: investor.kycStatus,
        last_updated:
          investor.lastUpdated || new Date().toISOString().split("T")[0],
      })),
    );

    if (error) {
      console.error("Error bulk creating investors:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in bulkCreateInvestors:", error);
    throw error;
  }
};

// Function to seed sample data into the database
const seedSampleData = async (): Promise<void> => {
  try {
    // Insert sample investors
    const { error: investorsError } = await supabase.from("investors").insert(
      sampleInvestors.map((investor) => ({
        id: investor.id,
        name: investor.name,
        email: investor.email,
        type: investor.type,
        wallet_address: investor.walletAddress,
        kyc_status: investor.kycStatus,
        last_updated: investor.lastUpdated,
      })),
    );

    if (investorsError) {
      console.error("Error seeding investors:", investorsError);
      return;
    }

    // Insert sample groups
    const groupInserts = await Promise.all(
      sampleGroups.map(async (group, index) => {
        const { data: groupData, error: groupError } = await supabase
          .from("investor_groups")
          .insert({ name: group.name })
          .select()
          .single();

        if (groupError) {
          console.error(`Error creating group ${group.name}:`, groupError);
          return null;
        }

        return { groupId: groupData.id, investorIds: group.investorIds };
      }),
    );

    // Insert group-investor relationships
    const validGroupInserts = groupInserts.filter(Boolean);
    for (const insert of validGroupInserts) {
      if (!insert) continue;

      const { error: relError } = await supabase
        .from("investor_groups_investors")
        .insert(
          insert.investorIds.map((investorId) => ({
            group_id: insert.groupId,
            investor_id: investorId,
          })),
        );

      if (relError) {
        console.error(`Error creating relationships for group:`, relError);
      }
    }

    console.log("Sample data seeded successfully");
  } catch (error) {
    console.error("Error seeding sample data:", error);
  }
};

export const bulkUpdateInvestors = async (
  ids: string[],
  updates: Partial<Investor>,
): Promise<void> => {
  try {
    // Supabase doesn't support bulk updates directly, so we need to do it one by one
    const updatePromises = ids.map((id) => updateInvestor(id, updates));
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error in bulkUpdateInvestors:", error);
    throw error;
  }
};

export const bulkDeleteInvestors = async (ids: string[]): Promise<void> => {
  const { error } = await supabase.from("investors").delete().in("id", ids);

  if (error) {
    console.error("Error bulk deleting investors:", error);
    throw error;
  }
};

// Group CRUD operations
export const fetchGroups = async (): Promise<InvestorGroup[]> => {
  try {
    // First get all groups
    const { data: groups, error: groupsError } = await supabase
      .from("investor_groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (groupsError) {
      console.error("Error fetching groups:", groupsError);
      // Return sample groups if there's an error
      return sampleGroups.map((group, index) => ({
        id: (index + 1).toString(),
        name: group.name,
        investorIds: group.investorIds,
      }));
    }

    if (!groups || groups.length === 0) {
      // If no groups in the database, return sample groups
      return sampleGroups.map((group, index) => ({
        id: (index + 1).toString(),
        name: group.name,
        investorIds: group.investorIds,
      }));
    }

    // Then get all group-investor relationships
    const { data: relationships, error: relError } = await supabase
      .from("investor_groups_investors")
      .select("*");

    if (relError) {
      console.error("Error fetching group relationships:", relError);
      throw relError;
    }

    // Map the relationships to the groups
    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      investorIds: relationships
        ? relationships
            .filter((rel) => rel.group_id === group.id)
            .map((rel) => rel.investor_id)
        : [],
    }));
  } catch (error) {
    console.error("Error in fetchGroups:", error);
    // Return sample groups as fallback
    return sampleGroups.map((group, index) => ({
      id: (index + 1).toString(),
      name: group.name,
      investorIds: group.investorIds,
    }));
  }
};

export const createGroup = async (
  name: string,
  investorIds: string[] = [],
): Promise<InvestorGroup> => {
  // First create the group
  const { data: group, error: groupError } = await supabase
    .from("investor_groups")
    .insert({ name })
    .select()
    .single();

  if (groupError) {
    console.error("Error creating group:", groupError);
    throw groupError;
  }

  // If there are investor IDs, create the relationships
  if (investorIds.length > 0) {
    const { error: relError } = await supabase
      .from("investor_groups_investors")
      .insert(
        investorIds.map((investorId) => ({
          group_id: group.id,
          investor_id: investorId,
        })),
      );

    if (relError) {
      console.error("Error creating group relationships:", relError);
      throw relError;
    }
  }

  return {
    id: group.id,
    name: group.name,
    investorIds,
  };
};

export const updateGroup = async (id: string, name: string): Promise<void> => {
  const { error } = await supabase
    .from("investor_groups")
    .update({ name })
    .eq("id", id);

  if (error) {
    console.error("Error updating group:", error);
    throw error;
  }
};

export const deleteGroup = async (id: string): Promise<void> => {
  // First delete all relationships
  const { error: relError } = await supabase
    .from("investor_groups_investors")
    .delete()
    .eq("group_id", id);

  if (relError) {
    console.error("Error deleting group relationships:", relError);
    throw relError;
  }

  // Then delete the group
  const { error } = await supabase
    .from("investor_groups")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
};

export const addInvestorsToGroup = async (
  groupId: string,
  investorIds: string[],
): Promise<void> => {
  // First get existing relationships to avoid duplicates
  const { data: existingRels, error: fetchError } = await supabase
    .from("investor_groups_investors")
    .select("investor_id")
    .eq("group_id", groupId);

  if (fetchError) {
    console.error("Error fetching existing relationships:", fetchError);
    throw fetchError;
  }

  // Filter out investors that are already in the group
  const existingInvestorIds = existingRels.map((rel) => rel.investor_id);
  const newInvestorIds = investorIds.filter(
    (id) => !existingInvestorIds.includes(id),
  );

  if (newInvestorIds.length === 0) return;

  // Add the new relationships
  const { error } = await supabase.from("investor_groups_investors").insert(
    newInvestorIds.map((investorId) => ({
      group_id: groupId,
      investor_id: investorId,
    })),
  );

  if (error) {
    console.error("Error adding investors to group:", error);
    throw error;
  }
};

export const removeInvestorsFromGroup = async (
  groupId: string,
  investorIds: string[],
): Promise<void> => {
  const { error } = await supabase
    .from("investor_groups_investors")
    .delete()
    .eq("group_id", groupId)
    .in("investor_id", investorIds);

  if (error) {
    console.error("Error removing investors from group:", error);
    throw error;
  }
};
