"use client";

import FooterAreaPublica from "@/components/FooterAreaPublica";
import HeaderAreaPublica from "@/components/HeaderAreaPublica";

import { motion, useScroll, useSpring } from "framer-motion";


export default function PaginaPublicaPaginaPlanos(){
    const { scrollYProgress } = useScroll();
    const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

    return(<>
        <HeaderAreaPublica/>
        
        {/* BARRA DE PROGRESSO */}
        <motion.div style={{ scaleX: progresso }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#588157] via-[#A3B18A] to-[#588157]"/>
        
        <FooterAreaPublica/>
    </>);
}