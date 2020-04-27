export {randomName}

const NAMES = [
    "Adeno",
    "Astro",
    "Banna",
    "Barmah-Forest",
    "Bunyamwera",
    "Cercopithecine",
    "Chandipura",
    "Chikungunya",
    "Choriomeningitis",
    "Cosa",
    "Cowpox",
    "Coxsackie",
    "Cytomegalo",
    "Dengue",
    "Dhori",
    "Dugbe",
    "Duvenhage",
    "Ebola",
    "Echo",
    "Encephalitis",
    "Encephalomyocarditis",
    "Entero",
    "Epstein-Barr",
    "Equine-Encephalitis",
    "Hantaan",
    "Hendra",
    "Hepatitis",
    "Isfahan",
    "Junin-Arena",
    "Kunjin",
    "Lagos",
    "Langat",
    "Lassa",
    "Lordsdale",
    "Louping-Ill",
    "Lyssa",
    "Machupo",
    "Mayaro",
    "Measles",
    "Mengo",
    "Merkel-Cell",
    "Mokola",
    "Molluscum",
    "Monkeypox",
    "Mumps",
    "Nipah",
    "Norwalk",
    "Orf",
    "Oropouche",
    "O'nyong-nyong",
    "Papilloma",
    "Parainfluenza",
    "Parvo",
    "Phlebo",
    "Pichinde",
    "Polio",
    "Polyoma",
    "Powassan",
    "Punta-Toro",
    "Puumala",
    "Rabies",
    "Rhino",
    "Rift",
    "Rosa",
    "Rota",
    "Rubella",
    "Sagiyama",
    "Salivirus",
    "Sapporo",
    "Semliki",
    "Seoul",
    "Simian",
    "Sindbis",
    "Snowshoe-Hare",
    "Spumaretro",
    "Toro",
    "Torque-Teno",
    "Uukuniemi",
    "Vaccinia",
    "Varicella-Zoster",
    "Variola",
    "Vesicular-Stomatitis",
    "Victoria-Marburg",
    "West-Nile",
    "Yaba",
    "Zika"
]

function randomName() {
    return NAMES[Math.floor(Math.random() * NAMES.length)];
}
