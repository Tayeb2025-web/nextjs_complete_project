import { listPublicContent } from "@/utils/learningContent";
export async function GET() {
  return listPublicContent("exercise");
}
