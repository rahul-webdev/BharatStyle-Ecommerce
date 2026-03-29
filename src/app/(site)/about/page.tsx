import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function AboutPage() {
  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>About</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h2
          className={cn([
            integralCF.className,
            "font-bold text-[32px] md:text-[40px] text-black uppercase mb-5 md:mb-6",
          ])}
        >
          about
        </h2>
        <div className="grid gap-6 md:gap-10 md:grid-cols-2">
          <div className="space-y-4 text-black/70">
            <p>
              We create everyday fashion with attention to quality, fit and
              style.
            </p>
            <p>
              Our mission is to make shopping simple and enjoyable, offering
              curated collections for men, women and kids across categories.
            </p>
            <p>
              From new arrivals to top-selling essentials, we blend design with
              comfort and value.
            </p>
          </div>
          <div className="rounded-[20px] border border-black/10 p-6 bg-[#F9F9F9]">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-black/60">Founded</span>
                <span className="font-semibold">2024</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-black/60">Headquarters</span>
                <span className="font-semibold">Remote-first</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-black/60">Categories</span>
                <span className="font-semibold">Men, Women, Kids</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-black/60">Customer Support</span>
                <span className="font-semibold">24/7</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}