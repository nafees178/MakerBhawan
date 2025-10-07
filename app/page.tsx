"use client";

import DockNavigation from '@/components/DockNavigation';
import HomeSection from '@/components/sections/HomeSection';
import AboutSection from '@/components/sections/AboutSection';
import FacilitiesSection from '@/components/sections/FacilitiesSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import EventsSection from '@/components/sections/EventsSection';
import TeamSection from '@/components/sections/TeamSection';
import GallerySection from '@/components/sections/GallerySection';
import ContactSection from '@/components/sections/ContactSection';


/*
Instructions for the frontend
-> make a multi page app... not a single page
-> the app should contain three pages
  -> Home
  -> People
  -> Events
  -> Projects
  -> Inventory

to get data from the database, the serivce is already setup
u just have to use the 2 functions from action.ts to get events, project, inventory
the schema of events, projects, inventory can be seen in the models folder where u can also find the interfaces for the three
i have already setup all the database connections... the only thing u need to do is setup a environmental variable
for MONGODB_URI... which i have sent u on whatsapp

for the events
-> render a card for every event which shows the title(name) of the event and render the html content(description) in a div
-> This card should take up maximum space of the screen... but not the whole width... add a good amount of horizontal padding

for the projects
-> render a card for every project which shows the title(name) of the project and render the html content(description) in a div
-> This card should take up maximum space of the screen... but not the whole width... add a good amount of horizontal padding

for the Inventory
-> u have to render a table where u have 3 columns
  -> col 1: name of the item
  -> col 2: number of items
-> NOTE: for each inventory u get a property in called hidden... so u have to only render the component when hidden = false


Overall:
-> make a good responsive multi paged app (use router)... and use consistent styling across the app...
-> for any more doubts... approach me
-> Please dont forget to add the connection string to .env in your local development enviroment and in the vercel secrets
-> the name of the secret is MONGODB_URI.
-> the connection string can be found in our whatsapp chats.

Post Notes:
-> to render a html content in a div use the following snippet.
  <div dangerouslySetInnerHTML={{ __html: content }}></div>
where content is the description value that u get in events and projects...
 */


export default function Home() {
  return (
    <main className="relative min-h-screen">
      <HomeSection />
      <AboutSection />
      <FacilitiesSection />
      <ProjectsSection />
      <EventsSection />
      <TeamSection />
      <GallerySection />
      <ContactSection />
      
      <DockNavigation />
    </main>
  );
}