'use client'
import MapComponent from '@/components/MapComponent/page'
import React from 'react'
import { motion } from "framer-motion"

const fadeInAnimationsVariants={
  initial:{
    opacity:0,
    y:100
  },
  animate: (index:number) => ({
    opacity:1,
    y:0,
    transition:{
      delay:0.05*index
    }
  }
)
}
const resources = () => {
  return (
    <>
      <motion.div
        variants={fadeInAnimationsVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={10}
        className="relative overflow-hidden flex px-10 py-10 md:p-10 bg-slate-800 text-white"
      >
        <div className="flex flex-col mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-bold tracking-tight first:mt-0">
            Our Resources
            </h3>
          </div>
          <div>
            <p className="leading-7 text-slate-400 font-semibold">Geographically distributed</p>
          </div>
        </div>
      </motion.div>
    <div className='m-2'>
    <MapComponent/>
</div>
    </>
  )
}

export default resources