import Header from "@/components/layout/Header";

export default function RootGroupLayout({ children }) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: "101px" }}>{children}</main>
    </>
  );
}