import { createFileRoute } from "@tanstack/react-router";
import { CovenantWorkbench } from "@/components/covenant-workbench";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CovenantWorkbench />;
}
