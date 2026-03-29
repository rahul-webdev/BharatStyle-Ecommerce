import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import React from "react";
import * as motion from "framer-motion/client";
import DressStyleCard from "./DressStyleCard";
import data from "@/data/index.json";

const DressStyle = () => {
  return (
    <div className="px-4 xl:px-0">
      <section className="max-w-frame mx-auto bg-[#F0F0F0] px-6 pb-6 pt-10 md:p-[70px] rounded-[40px] text-center">
        <motion.h2
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={cn([
            integralCF.className,
            "text-[32px] leading-[36px] md:text-5xl mb-8 md:mb-14 capitalize",
          ])}
        >
          BROWSE BY dress STYLE
        </motion.h2>
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-4 sm:space-y-0 sm:space-x-5 mb-4 sm:mb-5"
        >
          {data.dressStyles.slice(0, 2).map((item) => (
            <DressStyleCard
              key={item.id}
              title={item.title}
              url={item.url}
              srcUrl={item.srcUrl}
              className={cn([
                item.title === "Casual" && "md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px]",
                item.title === "Formal" && "md:max-w-[684px]",
                "h-[190px] bg-cover bg-top",
              ])}
              
            />
          ))}
        </motion.div>
        <motion.div
          initial={{ y: "100px", opacity: 0 }}
          whileInView={{ y: "0", opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row md:h-[289px] space-y-5 sm:space-y-0 sm:space-x-5"
        >
          {data.dressStyles.slice(2, 4).map((item) => (
            <DressStyleCard
              key={item.id}
              title={item.title}
              url={item.url}
              srcUrl={item.srcUrl}
              className={cn([
                 item.title === "Gym" && "md:max-w-[260px] lg:max-w-[360px] xl:max-w-[407px]",
                 item.title === "Party" && "md:max-w-[684px]",
                "h-[190px] bg-cover bg-top"
              ])}
            />
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default DressStyle;
