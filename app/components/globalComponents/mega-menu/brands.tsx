
import { NavigationMenuLink } from "@/components/ui/navigation-menu"
import { ListItem } from "../ListItem"

export function BrandsMenu() {
  return (
    <ul className="grid bg-white gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
      <li className="row-span-3">
        <NavigationMenuLink asChild>
          <a
            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
            href="/"
          >
            <div className="mb-2 mt-4 text-lg font-medium">
              shadcn/ui
            </div>
            <p className="text-sm leading-tight text-muted-foreground">
              adasdas
            </p>
          </a>
        </NavigationMenuLink>
      </li>
      <ListItem href="/docs" title="Introduction">
        Re-usable components built using Radix UI and Tailwind CSS.
      </ListItem>
      <ListItem href="/docs/installation" title="Installation">
        How to install dependencies and structure your app.
      </ListItem>
      <ListItem href="/docs/primitives/typography" title="Typography">
        Styles for headings, paragraphs, lists...etc
      </ListItem>
    </ul>
  )
}