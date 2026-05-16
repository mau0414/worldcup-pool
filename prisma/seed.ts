import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"


const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const matches = [
    // ─── GROUP A ───
    { teamA: "Mexico", teamB: "South Africa", matchDate: new Date("2026-06-11T19:00:00Z"), group: "A" },
    { teamA: "South Korea", teamB: "Czechia", matchDate: new Date("2026-06-12T02:00:00Z"), group: "A" },
    { teamA: "Czechia", teamB: "South Africa", matchDate: new Date("2026-06-18T17:00:00Z"), group: "A" },
    { teamA: "Mexico", teamB: "South Korea", matchDate: new Date("2026-06-19T03:00:00Z"), group: "A" },
    { teamA: "Czechia", teamB: "Mexico", matchDate: new Date("2026-06-25T03:00:00Z"), group: "A" },
    { teamA: "South Africa", teamB: "South Korea", matchDate: new Date("2026-06-25T03:00:00Z"), group: "A" },

    // ─── GROUP B ───
    { teamA: "Canada", teamB: "Bosnia and Herzegovina", matchDate: new Date("2026-06-12T19:00:00Z"), group: "B" },
    { teamA: "Qatar", teamB: "Switzerland", matchDate: new Date("2026-06-13T19:00:00Z"), group: "B" },
    { teamA: "Switzerland", teamB: "Bosnia and Herzegovina", matchDate: new Date("2026-06-18T23:00:00Z"), group: "B" },
    { teamA: "Canada", teamB: "Qatar", matchDate: new Date("2026-06-19T02:00:00Z"), group: "B" },
    { teamA: "Switzerland", teamB: "Canada", matchDate: new Date("2026-06-24T23:00:00Z"), group: "B" },
    { teamA: "Bosnia and Herzegovina", teamB: "Qatar", matchDate: new Date("2026-06-24T23:00:00Z"), group: "B" },

    // ─── GROUP C ───
    { teamA: "Brazil", teamB: "Morocco", matchDate: new Date("2026-06-13T23:00:00Z"), group: "C" },
    { teamA: "Haiti", teamB: "Scotland", matchDate: new Date("2026-06-14T01:00:00Z"), group: "C" },
    { teamA: "Scotland", teamB: "Morocco", matchDate: new Date("2026-06-19T23:00:00Z"), group: "C" },
    { teamA: "Brazil", teamB: "Haiti", matchDate: new Date("2026-06-20T02:00:00Z"), group: "C" },
    { teamA: "Scotland", teamB: "Brazil", matchDate: new Date("2026-06-24T23:00:00Z"), group: "C" },
    { teamA: "Morocco", teamB: "Haiti", matchDate: new Date("2026-06-24T23:00:00Z"), group: "C" },

    // ─── GROUP D ───
    { teamA: "United States", teamB: "Paraguay", matchDate: new Date("2026-06-13T01:00:00Z"), group: "D" },
    { teamA: "Australia", teamB: "Turkiye", matchDate: new Date("2026-06-14T04:00:00Z"), group: "D" },
    { teamA: "United States", teamB: "Australia", matchDate: new Date("2026-06-19T23:00:00Z"), group: "D" },
    { teamA: "Turkiye", teamB: "Paraguay", matchDate: new Date("2026-06-20T08:00:00Z"), group: "D" },
    { teamA: "Turkiye", teamB: "United States", matchDate: new Date("2026-06-26T06:00:00Z"), group: "D" },
    { teamA: "Paraguay", teamB: "Australia", matchDate: new Date("2026-06-26T06:00:00Z"), group: "D" },

    // ─── GROUP E ───
    { teamA: "Germany", teamB: "Curacao", matchDate: new Date("2026-06-14T18:00:00Z"), group: "E" },
    { teamA: "Ivory Coast", teamB: "Ecuador", matchDate: new Date("2026-06-15T00:00:00Z"), group: "E" },
    { teamA: "Germany", teamB: "Ivory Coast", matchDate: new Date("2026-06-20T21:00:00Z"), group: "E" },
    { teamA: "Ecuador", teamB: "Curacao", matchDate: new Date("2026-06-21T04:00:00Z"), group: "E" },
    { teamA: "Ecuador", teamB: "Germany", matchDate: new Date("2026-06-25T21:00:00Z"), group: "E" },
    { teamA: "Curacao", teamB: "Ivory Coast", matchDate: new Date("2026-06-25T21:00:00Z"), group: "E" },

    // ─── GROUP F ───
    { teamA: "Netherlands", teamB: "Japan", matchDate: new Date("2026-06-14T21:00:00Z"), group: "F" },
    { teamA: "Sweden", teamB: "Tunisia", matchDate: new Date("2026-06-15T04:00:00Z"), group: "F" },
    { teamA: "Netherlands", teamB: "Sweden", matchDate: new Date("2026-06-20T19:00:00Z"), group: "F" },
    { teamA: "Tunisia", teamB: "Japan", matchDate: new Date("2026-06-21T06:00:00Z"), group: "F" },
    { teamA: "Japan", teamB: "Sweden", matchDate: new Date("2026-06-26T01:00:00Z"), group: "F" },
    { teamA: "Tunisia", teamB: "Netherlands", matchDate: new Date("2026-06-26T01:00:00Z"), group: "F" },

    // ─── GROUP G ───
    { teamA: "Belgium", teamB: "Egypt", matchDate: new Date("2026-06-15T23:00:00Z"), group: "G" },
    { teamA: "Iran", teamB: "New Zealand", matchDate: new Date("2026-06-16T05:00:00Z"), group: "G" },
    { teamA: "Belgium", teamB: "Iran", matchDate: new Date("2026-06-21T23:00:00Z"), group: "G" },
    { teamA: "New Zealand", teamB: "Egypt", matchDate: new Date("2026-06-22T05:00:00Z"), group: "G" },
    { teamA: "Egypt", teamB: "Iran", matchDate: new Date("2026-06-27T07:00:00Z"), group: "G" },
    { teamA: "New Zealand", teamB: "Belgium", matchDate: new Date("2026-06-27T07:00:00Z"), group: "G" },

    // ─── GROUP H ───
    { teamA: "Spain", teamB: "Cape Verde", matchDate: new Date("2026-06-15T17:00:00Z"), group: "H" },
    { teamA: "Saudi Arabia", teamB: "Uruguay", matchDate: new Date("2026-06-15T23:00:00Z"), group: "H" },
    { teamA: "Spain", teamB: "Saudi Arabia", matchDate: new Date("2026-06-21T17:00:00Z"), group: "H" },
    { teamA: "Uruguay", teamB: "Cape Verde", matchDate: new Date("2026-06-21T23:00:00Z"), group: "H" },
    { teamA: "Cape Verde", teamB: "Saudi Arabia", matchDate: new Date("2026-06-27T02:00:00Z"), group: "H" },
    { teamA: "Uruguay", teamB: "Spain", matchDate: new Date("2026-06-27T02:00:00Z"), group: "H" },

    // ─── GROUP I ───
    { teamA: "France", teamB: "Senegal", matchDate: new Date("2026-06-16T20:00:00Z"), group: "I" },
    { teamA: "Iraq", teamB: "Norway", matchDate: new Date("2026-06-16T23:00:00Z"), group: "I" },
    { teamA: "France", teamB: "Iraq", matchDate: new Date("2026-06-22T22:00:00Z"), group: "I" },
    { teamA: "Norway", teamB: "Senegal", matchDate: new Date("2026-06-23T01:00:00Z"), group: "I" },
    { teamA: "Norway", teamB: "France", matchDate: new Date("2026-06-26T20:00:00Z"), group: "I" },
    { teamA: "Senegal", teamB: "Iraq", matchDate: new Date("2026-06-26T20:00:00Z"), group: "I" },

    // ─── GROUP J ───
    { teamA: "Argentina", teamB: "Algeria", matchDate: new Date("2026-06-17T03:00:00Z"), group: "J" },
    { teamA: "Austria", teamB: "Jordan", matchDate: new Date("2026-06-17T08:00:00Z"), group: "J" },
    { teamA: "Argentina", teamB: "Austria", matchDate: new Date("2026-06-22T19:00:00Z"), group: "J" },
    { teamA: "Jordan", teamB: "Algeria", matchDate: new Date("2026-06-23T07:00:00Z"), group: "J" },
    { teamA: "Algeria", teamB: "Austria", matchDate: new Date("2026-06-28T04:00:00Z"), group: "J" },
    { teamA: "Jordan", teamB: "Argentina", matchDate: new Date("2026-06-28T04:00:00Z"), group: "J" },

    // ─── GROUP K ───
    { teamA: "Portugal", teamB: "DR Congo", matchDate: new Date("2026-06-17T19:00:00Z"), group: "K" },
    { teamA: "Uzbekistan", teamB: "Colombia", matchDate: new Date("2026-06-18T04:00:00Z"), group: "K" },
    { teamA: "Portugal", teamB: "Uzbekistan", matchDate: new Date("2026-06-23T19:00:00Z"), group: "K" },
    { teamA: "Colombia", teamB: "DR Congo", matchDate: new Date("2026-06-24T04:00:00Z"), group: "K" },
    { teamA: "Colombia", teamB: "Portugal", matchDate: new Date("2026-06-27T23:30:00Z"), group: "K" },
    { teamA: "DR Congo", teamB: "Uzbekistan", matchDate: new Date("2026-06-27T23:30:00Z"), group: "K" },

    // ─── GROUP L ───
    { teamA: "England", teamB: "Croatia", matchDate: new Date("2026-06-17T22:00:00Z"), group: "L" },
    { teamA: "Ghana", teamB: "Panama", matchDate: new Date("2026-06-18T00:00:00Z"), group: "L" },
    { teamA: "England", teamB: "Ghana", matchDate: new Date("2026-06-23T21:00:00Z"), group: "L" },
    { teamA: "Panama", teamB: "Croatia", matchDate: new Date("2026-06-24T00:00:00Z"), group: "L" },
    { teamA: "Panama", teamB: "England", matchDate: new Date("2026-06-27T22:00:00Z"), group: "L" },
    { teamA: "Croatia", teamB: "Ghana", matchDate: new Date("2026-06-27T22:00:00Z"), group: "L" },
    ]

async function main() {
    await prisma.match.createMany({
        data: matches
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())