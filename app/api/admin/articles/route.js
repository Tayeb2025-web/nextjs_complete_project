import { listAdminContent, saveAdminContent } from "@/utils/learningContent";
export async function GET(req) {
  return listAdminContent(req, "article");
}
export async function POST(req) {
  return saveAdminContent(req, "article");
}
