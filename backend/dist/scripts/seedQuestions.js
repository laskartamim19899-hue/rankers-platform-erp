"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const questions = [
        // PHYSICS
        {
            subject: 'PHYSICS',
            topic: 'Electrostatics',
            content: 'A point charge $q$ is placed at the center of a cubic Gaussian surface. The electric flux through any one of the faces is:',
            difficulty: 'MEDIUM',
            options: [
                { id: 'A', text: '$q/\\epsilon_0$' },
                { id: 'B', text: '$q/4\\epsilon_0$' },
                { id: 'C', text: '$q/6\\epsilon_0$' },
                { id: 'D', text: '$q/8\\epsilon_0$' }
            ],
            correctOption: 'C',
            explanation: 'Total flux through the cube is $q/\\epsilon_0$. Since the cube has 6 faces, the flux through one face is $1/6$ of total flux.'
        },
        {
            subject: 'PHYSICS',
            topic: 'Optics',
            content: 'The focal length of a convex lens is $20$ cm. Its power is:',
            difficulty: 'EASY',
            options: [
                { id: 'A', text: '$+5$ D' },
                { id: 'B', text: '$-5$ D' },
                { id: 'C', text: '$+2$ D' },
                { id: 'D', text: '$-2$ D' }
            ],
            correctOption: 'A',
            explanation: 'Power $P = 1/f(m)$. $f = 20$ cm $= 0.2$ m. $P = 1/0.2 = +5$ D.'
        },
        // CHEMISTRY
        {
            subject: 'CHEMISTRY',
            topic: 'Thermodynamics',
            content: 'For an isothermal expansion of an ideal gas into vacuum, the work done ($w$) is:',
            difficulty: 'MEDIUM',
            options: [
                { id: 'A', text: '$w = -P_{ext}\\Delta V$' },
                { id: 'B', text: '$w = 0$' },
                { id: 'C', text: '$w = nRT \\ln(V_2/V_1)$' },
                { id: 'D', text: '$w = q$' }
            ],
            correctOption: 'B',
            explanation: 'Expansion into vacuum ($P_{ext} = 0$) is free expansion. $w = -P_{ext}\\Delta V = 0$.'
        },
        {
            subject: 'CHEMISTRY',
            topic: 'Organic Chemistry',
            content: 'Which of the following follows Markovnikov rule for addition of HBr?',
            difficulty: 'MEDIUM',
            options: [
                { id: 'A', text: 'Ethylene' },
                { id: 'B', text: 'Propene' },
                { id: 'C', text: 'But-2-ene' },
                { id: 'D', text: 'Cyclohexene' },
            ],
            correctOption: 'B',
            explanation: 'Markovnikov rule applies to unsymmetrical alkenes. Propene is unsymmetrical.'
        },
        // BIOLOGY
        {
            subject: 'BIOLOGY',
            topic: 'Cell Biology',
            content: 'Which organelle is known as the "Powerhouse of the Cell"?',
            difficulty: 'EASY',
            options: [
                { id: 'A', text: 'Nucleus' },
                { id: 'B', text: 'Golgi Complex' },
                { id: 'C', text: 'Mitochondria' },
                { id: 'D', text: 'Ribosomes' }
            ],
            correctOption: 'C',
            explanation: 'Mitochondria are responsible for ATP production via cellular respiration.'
        },
        {
            subject: 'BIOLOGY',
            topic: 'Genetics',
            content: 'The phenotypic ratio of a dihybrid cross in $F_2$ generation is:',
            difficulty: 'MEDIUM',
            options: [
                { id: 'A', text: '3:1' },
                { id: 'B', text: '1:2:1' },
                { id: 'C', text: '9:3:3:1' },
                { id: 'D', text: '1:1:1:1' }
            ],
            correctOption: 'C',
            explanation: 'According to Mendel Law of Independent Assortment, the ratio is 9:3:3:1.'
        }
    ];
    console.log('Seeding original questions...');
    for (const q of questions) {
        await prisma.question.create({
            data: q
        });
    }
    console.log('Seeding completed.');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seedQuestions.js.map