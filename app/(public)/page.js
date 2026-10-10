import HomeHero from "@/components/sections/home/HomeHero";
import HomeCatalog from "@/components/sections/home/HomeCatalog";
import HomeBenefits from "@/components/sections/home/HomeBenefits";
import HomeFAQ from "@/components/sections/home/HomeFAQ";
import HomeSupport from "@/components/sections/home/HomeSupport";

export const metadata = {
  title: "آموزش برنامه‌نویسی و طراحی وب",
  description:
    "یادگیری قدم‌به‌قدم طراحی وب و برنامه‌نویسی؛ دوره‌های HTML و CSS، JavaScript، React و Node.js همراه با راهنمای شروع یادگیری.",
};

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeCatalog />
      <HomeBenefits />
      <HomeFAQ />
      <HomeSupport />
    </>
  );
}
