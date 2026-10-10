import { saveAdminContent, deleteAdminContent } from "@/utils/learningContent";
export async function PUT(req, { params }) {
  const { id } = await params;
  return saveAdminContent(req, "exercise", id);
}
export async function DELETE(req, { params }) {
  const { id } = await params;
  return deleteAdminContent(req, "exercise", id);
}
