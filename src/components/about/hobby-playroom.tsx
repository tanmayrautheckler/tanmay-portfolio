"use client";
import { Goal, Compass } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenaltyShootout } from "./penalty-shootout";
import { TravelFilm } from "./travel-film";
import styles from "./playroom.module.css";

export function HobbyPlayroom(){return <Tabs defaultValue="soccer" className={styles.playroom}>
  <TabsList variant="line" className={styles.gameTabs} aria-label="Explore my hobbies"><TabsTrigger value="soccer"><Goal size={17}/>Penalty shootout</TabsTrigger><TabsTrigger value="travel"><Compass size={17}/>Photo in motion</TabsTrigger></TabsList>
  <TabsContent value="soccer" forceMount className="data-[state=inactive]:hidden"><PenaltyShootout/></TabsContent><TabsContent value="travel" forceMount className="data-[state=inactive]:hidden"><TravelFilm/></TabsContent>
</Tabs>;}
