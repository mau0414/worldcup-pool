import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"


const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const matches = [
    // ─── GROUP A ───
    { teamA: "México", teamB: "África do Sul", matchDate: new Date("2026-06-11T19:00:00Z"), group: "A", round: 1 },
    { teamA: "Coreia do Sul", teamB: "Tchéquia", matchDate: new Date("2026-06-12T02:00:00Z"), group: "A", round: 1 },
    { teamA: "Tchéquia", teamB: "África do Sul", matchDate: new Date("2026-06-18T17:00:00Z"), group: "A", round: 2 },
    { teamA: "México", teamB: "Coreia do Sul", matchDate: new Date("2026-06-19T03:00:00Z"), group: "A", round: 2 },
    { teamA: "Tchéquia", teamB: "México", matchDate: new Date("2026-06-25T03:00:00Z"), group: "A", round: 3 },
    { teamA: "África do Sul", teamB: "Coreia do Sul", matchDate: new Date("2026-06-25T03:00:00Z"), group: "A", round: 3 },

    // ─── GROUP B ───
    { teamA: "Canadá", teamB: "Bósnia e Herzegovina", matchDate: new Date("2026-06-12T19:00:00Z"), group: "B", round: 1 },
    { teamA: "Catar", teamB: "Suíça", matchDate: new Date("2026-06-13T19:00:00Z"), group: "B", round: 1 },
    { teamA: "Suíça", teamB: "Bósnia e Herzegovina", matchDate: new Date("2026-06-18T23:00:00Z"), group: "B", round: 2 },
    { teamA: "Canadá", teamB: "Catar", matchDate: new Date("2026-06-19T02:00:00Z"), group: "B", round: 2 },
    { teamA: "Suíça", teamB: "Canadá", matchDate: new Date("2026-06-24T23:00:00Z"), group: "B", round: 3 },
    { teamA: "Bósnia e Herzegovina", teamB: "Catar", matchDate: new Date("2026-06-24T23:00:00Z"), group: "B", round: 3 },

    // ─── GROUP C ───
    { teamA: "Brasil", teamB: "Marrocos", matchDate: new Date("2026-06-13T23:00:00Z"), group: "C", round: 1 },
    { teamA: "Haiti", teamB: "Escócia", matchDate: new Date("2026-06-14T01:00:00Z"), group: "C", round: 1 },
    { teamA: "Escócia", teamB: "Marrocos", matchDate: new Date("2026-06-19T23:00:00Z"), group: "C", round: 2 },
    { teamA: "Brasil", teamB: "Haiti", matchDate: new Date("2026-06-20T02:00:00Z"), group: "C", round: 2 },
    { teamA: "Escócia", teamB: "Brasil", matchDate: new Date("2026-06-24T23:00:00Z"), group: "C", round: 3 },
    { teamA: "Marrocos", teamB: "Haiti", matchDate: new Date("2026-06-24T23:00:00Z"), group: "C", round: 3 },

    // ─── GROUP D ───
    { teamA: "Estados Unidos", teamB: "Paraguai", matchDate: new Date("2026-06-13T01:00:00Z"), group: "D", round: 1 },
    { teamA: "Austrália", teamB: "Turquia", matchDate: new Date("2026-06-14T04:00:00Z"), group: "D", round: 1 },
    { teamA: "Estados Unidos", teamB: "Austrália", matchDate: new Date("2026-06-19T23:00:00Z"), group: "D", round: 2 },
    { teamA: "Turquia", teamB: "Paraguai", matchDate: new Date("2026-06-20T08:00:00Z"), group: "D", round: 2 },
    { teamA: "Turquia", teamB: "Estados Unidos", matchDate: new Date("2026-06-26T06:00:00Z"), group: "D", round: 3 },
    { teamA: "Paraguai", teamB: "Austrália", matchDate: new Date("2026-06-26T06:00:00Z"), group: "D", round: 3 },

    // ─── GROUP E ───
    { teamA: "Alemanha", teamB: "Curaçao", matchDate: new Date("2026-06-14T18:00:00Z"), group: "E", round: 1 },
    { teamA: "Costa do Marfim", teamB: "Equador", matchDate: new Date("2026-06-15T00:00:00Z"), group: "E", round: 1 },
    { teamA: "Alemanha", teamB: "Costa do Marfim", matchDate: new Date("2026-06-20T21:00:00Z"), group: "E", round: 2 },
    { teamA: "Equador", teamB: "Curaçao", matchDate: new Date("2026-06-21T04:00:00Z"), group: "E", round: 2 },
    { teamA: "Equador", teamB: "Alemanha", matchDate: new Date("2026-06-25T21:00:00Z"), group: "E", round: 3 },
    { teamA: "Curaçao", teamB: "Costa do Marfim", matchDate: new Date("2026-06-25T21:00:00Z"), group: "E", round: 3 },

    // ─── GROUP F ───
    { teamA: "Países Baixos", teamB: "Japão", matchDate: new Date("2026-06-14T21:00:00Z"), group: "F", round: 1 },
    { teamA: "Suécia", teamB: "Tunísia", matchDate: new Date("2026-06-15T04:00:00Z"), group: "F", round: 1 },
    { teamA: "Países Baixos", teamB: "Suécia", matchDate: new Date("2026-06-20T19:00:00Z"), group: "F", round: 2 },
    { teamA: "Tunísia", teamB: "Japão", matchDate: new Date("2026-06-21T06:00:00Z"), group: "F", round: 2 },
    { teamA: "Japão", teamB: "Suécia", matchDate: new Date("2026-06-26T01:00:00Z"), group: "F", round: 3 },
    { teamA: "Tunísia", teamB: "Países Baixos", matchDate: new Date("2026-06-26T01:00:00Z"), group: "F", round: 3 },

    // ─── GROUP G ───
    { teamA: "Bélgica", teamB: "Egito", matchDate: new Date("2026-06-15T23:00:00Z"), group: "G", round: 1 },
    { teamA: "Irã", teamB: "Nova Zelândia", matchDate: new Date("2026-06-16T05:00:00Z"), group: "G", round: 1 },
    { teamA: "Bélgica", teamB: "Irã", matchDate: new Date("2026-06-21T23:00:00Z"), group: "G", round: 2 },
    { teamA: "Nova Zelândia", teamB: "Egito", matchDate: new Date("2026-06-22T05:00:00Z"), group: "G", round: 2 },
    { teamA: "Egito", teamB: "Irã", matchDate: new Date("2026-06-27T07:00:00Z"), group: "G", round: 3 },
    { teamA: "Nova Zelândia", teamB: "Bélgica", matchDate: new Date("2026-06-27T07:00:00Z"), group: "G", round: 3 },

    // ─── GROUP H ───
    { teamA: "Espanha", teamB: "Cabo Verde", matchDate: new Date("2026-06-15T17:00:00Z"), group: "H", round: 1 },
    { teamA: "Arábia Saudita", teamB: "Uruguai", matchDate: new Date("2026-06-15T23:00:00Z"), group: "H", round: 1 },
    { teamA: "Espanha", teamB: "Arábia Saudita", matchDate: new Date("2026-06-21T17:00:00Z"), group: "H", round: 2 },
    { teamA: "Uruguai", teamB: "Cabo Verde", matchDate: new Date("2026-06-21T23:00:00Z"), group: "H", round: 2 },
    { teamA: "Cabo Verde", teamB: "Arábia Saudita", matchDate: new Date("2026-06-27T02:00:00Z"), group: "H", round: 3 },
    { teamA: "Uruguai", teamB: "Espanha", matchDate: new Date("2026-06-27T02:00:00Z"), group: "H", round: 3 },

    // ─── GROUP I ───
    { teamA: "França", teamB: "Senegal", matchDate: new Date("2026-06-16T20:00:00Z"), group: "I", round: 1 },
    { teamA: "Iraque", teamB: "Noruega", matchDate: new Date("2026-06-16T23:00:00Z"), group: "I", round: 1 },
    { teamA: "França", teamB: "Iraque", matchDate: new Date("2026-06-22T22:00:00Z"), group: "I", round: 2 },
    { teamA: "Noruega", teamB: "Senegal", matchDate: new Date("2026-06-23T01:00:00Z"), group: "I", round: 2 },
    { teamA: "Noruega", teamB: "França", matchDate: new Date("2026-06-26T20:00:00Z"), group: "I", round: 3 },
    { teamA: "Senegal", teamB: "Iraque", matchDate: new Date("2026-06-26T20:00:00Z"), group: "I", round: 3 },

    // ─── GROUP J ───
    { teamA: "Argentina", teamB: "Argélia", matchDate: new Date("2026-06-17T03:00:00Z"), group: "J", round: 1 },
    { teamA: "Áustria", teamB: "Jordânia", matchDate: new Date("2026-06-17T08:00:00Z"), group: "J", round: 1 },
    { teamA: "Argentina", teamB: "Áustria", matchDate: new Date("2026-06-22T19:00:00Z"), group: "J", round: 2 },
    { teamA: "Jordânia", teamB: "Argélia", matchDate: new Date("2026-06-23T07:00:00Z"), group: "J", round: 2 },
    { teamA: "Argélia", teamB: "Áustria", matchDate: new Date("2026-06-28T04:00:00Z"), group: "J", round: 3 },
    { teamA: "Jordânia", teamB: "Argentina", matchDate: new Date("2026-06-28T04:00:00Z"), group: "J", round: 3 },

    // ─── GROUP K ───
    { teamA: "Portugal", teamB: "República Democrática do Congo", matchDate: new Date("2026-06-17T19:00:00Z"), group: "K", round: 1 },
    { teamA: "Uzbequistão", teamB: "Colômbia", matchDate: new Date("2026-06-18T04:00:00Z"), group: "K", round: 1 },
    { teamA: "Portugal", teamB: "Uzbequistão", matchDate: new Date("2026-06-23T19:00:00Z"), group: "K", round: 2 },
    { teamA: "Colômbia", teamB: "República Democrática do Congo", matchDate: new Date("2026-06-24T04:00:00Z"), group: "K", round: 2 },
    { teamA: "Colômbia", teamB: "Portugal", matchDate: new Date("2026-06-27T23:30:00Z"), group: "K", round: 3 },
    { teamA: "República Democrática do Congo", teamB: "Uzbequistão", matchDate: new Date("2026-06-27T23:30:00Z"), group: "K", round: 3 },

    // ─── GROUP L ───
    { teamA: "Inglaterra", teamB: "Croácia", matchDate: new Date("2026-06-17T22:00:00Z"), group: "L", round: 1 },
    { teamA: "Gana", teamB: "Panamá", matchDate: new Date("2026-06-18T00:00:00Z"), group: "L", round: 1 },
    { teamA: "Inglaterra", teamB: "Gana", matchDate: new Date("2026-06-23T21:00:00Z"), group: "L", round: 2 },
    { teamA: "Panamá", teamB: "Croácia", matchDate: new Date("2026-06-24T00:00:00Z"), group: "L", round: 2 },
    { teamA: "Panamá", teamB: "Inglaterra", matchDate: new Date("2026-06-27T22:00:00Z"), group: "L", round: 3 },
    { teamA: "Croácia", teamB: "Gana", matchDate: new Date("2026-06-27T22:00:00Z"), group: "L", round: 3 },
    ]

const currentRound = {round: 1, firstMatchDate: new Date("2026-06-11T19:00:00Z"), lastMatchDate: new Date("2026-06-18T04:00:00Z"), status: "open"  }

async function main() {
    // await prisma.match.createMany({
    //     data: matches
    // })

    await prisma.currentRound.create({
        data: currentRound
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())