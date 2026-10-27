import { notFound } from "next/navigation"
import { GoalExperience } from "@/components/goal-experience"
import { ThreeDaysExperience } from "@/components/three-days-experience"
import { CageWildExperience } from "@/components/cage-wild-experience"

const experiences = {
  goal: GoalExperience,
  threedays: ThreeDaysExperience,
  cagewild: CageWildExperience
} as const

export default async function PlayPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ join?: string }>
}) {
  const { slug } = await params
  const { join } = await searchParams
  const Experience = experiences[slug as keyof typeof experiences]
  if (!Experience) notFound()
  return <Experience initialJoinCode={join ?? ""} />
}
