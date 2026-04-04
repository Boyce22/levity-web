"use server";

import { diagramRepo } from "@/repositories";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyJwtToken } from "@/lib/auth";
import { assertUserOwnsCard } from "@/modules/workspace/actions/assertions";

async function getUserId() {
  const token = (await cookies()).get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const payload = await verifyJwtToken(token);
  if (!payload || !payload.id) throw new Error("Unauthorized");
  return payload.id as string;
}

export async function getDiagramAction(cardId: string) {
  const userId = await getUserId();
  // 🛡️ Security Check: Ensure user has access to the card
  await assertUserOwnsCard(userId, cardId);

  return diagramRepo.findByCardId(cardId);
}

export async function saveDiagramAction(cardId: string, diagramData: any) {
  const userId = await getUserId();
  
  // 🛡️ Security Check: Ensure user has edit access to the card
  // assertUserOwnsCard checks if the user is a member of the workspace.
  // In a robust system, we'd also check for 'member/editor' roles.
  const { workspace_id } = await assertUserOwnsCard(userId, cardId);
  // (Optional: add role check here if needed, but assertUserOwnsCard is a good start)

  const diagram = await diagramRepo.save(cardId, diagramData);
  
  revalidatePath("/");
  return diagram;
}
