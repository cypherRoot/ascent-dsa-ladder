import problems from "@/data/problems.json";
import meta from "@/data/meta.json";
import type { Meta, Problem } from "@/lib/types";
import Ladder from "@/components/Ladder";
import SmoothScroll from "@/components/SmoothScroll";

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Ladder problems={problems as Problem[]} meta={meta as Meta} />
    </>
  );
}
