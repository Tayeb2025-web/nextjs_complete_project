import { listAdminContent, saveAdminContent } from "@/utils/learningContent";
export async function GET(req) {
  return listAdminContent(req, "exercise");
}
export async function POST(req) {
  return saveAdminContent(req, "exercise");
}
