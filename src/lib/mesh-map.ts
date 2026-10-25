// Starter map from MeSH descriptor names to subspecialties, matched exactly
// against a paper's MeSH headings. To be reviewed with the first user.
// Papers with no match are tagged "general".
export const MESH_TO_SUBSPECIALTY: Record<string, readonly string[]> = {
  // Cornea and external disease
  "Cornea": ["cornea"],
  "Corneal Diseases": ["cornea"],
  "Endothelium, Corneal": ["cornea"],
  "Corneal Endothelial Cell Loss": ["cornea"],
  "Corneal Dystrophies, Hereditary": ["cornea"],
  "Corneal Ulcer": ["cornea"],
  "Keratitis": ["cornea"],
  "Keratoconus": ["cornea"],
  "Corneal Transplantation": ["cornea"],
  "Keratoplasty, Penetrating": ["cornea"],
  "Descemet Stripping Endothelial Keratoplasty": ["cornea"],
  "Fuchs' Endothelial Dystrophy": ["cornea"],
  "Dry Eye Syndromes": ["cornea"],
  "Keratoconjunctivitis Sicca": ["cornea"],
  "Meibomian Gland Dysfunction": ["cornea"],
  "Conjunctiva": ["cornea"],
  "Conjunctival Diseases": ["cornea"],
  "Conjunctivitis": ["cornea"],
  "Conjunctivitis, Allergic": ["cornea"],
  "Pterygium": ["cornea"],
  "Blepharitis": ["cornea"],

  // Cataract and refractive
  "Cataract": ["cataract-refractive"],
  "Cataract Extraction": ["cataract-refractive"],
  "Phacoemulsification": ["cataract-refractive"],
  "Lens Implantation, Intraocular": ["cataract-refractive"],
  "Lenses, Intraocular": ["cataract-refractive"],
  "Capsule Opacification": ["cataract-refractive"],
  "Refractive Errors": ["cataract-refractive"],
  "Myopia": ["cataract-refractive"],
  "Hyperopia": ["cataract-refractive"],
  "Astigmatism": ["cataract-refractive"],
  "Presbyopia": ["cataract-refractive"],
  "Refractive Surgical Procedures": ["cataract-refractive"],
  "Keratomileusis, Laser In Situ": ["cataract-refractive"],
  "Photorefractive Keratectomy": ["cataract-refractive"],
  "Phakic Intraocular Lenses": ["cataract-refractive"],

  // Glaucoma
  "Glaucoma": ["glaucoma"],
  "Glaucoma, Open-Angle": ["glaucoma"],
  "Glaucoma, Angle-Closure": ["glaucoma"],
  "Glaucoma, Neovascular": ["glaucoma"],
  "Low Tension Glaucoma": ["glaucoma"],
  "Ocular Hypertension": ["glaucoma"],
  "Intraocular Pressure": ["glaucoma"],
  "Trabeculectomy": ["glaucoma"],
  "Glaucoma Drainage Implants": ["glaucoma"],
  "Antiglaucoma Agents": ["glaucoma"],
  "Filtering Surgery": ["glaucoma"],

  // Retina and vitreous
  "Retina": ["retina"],
  "Retinal Diseases": ["retina"],
  "Macular Degeneration": ["retina"],
  "Wet Macular Degeneration": ["retina"],
  "Geographic Atrophy": ["retina"],
  "Diabetic Retinopathy": ["retina"],
  "Macular Edema": ["retina"],
  "Retinal Vein Occlusion": ["retina"],
  "Retinal Artery Occlusion": ["retina"],
  "Retinal Detachment": ["retina"],
  "Retinal Perforations": ["retina"],
  "Epiretinal Membrane": ["retina"],
  "Central Serous Chorioretinopathy": ["retina"],
  "Retinitis Pigmentosa": ["retina"],
  "Vitreous Body": ["retina"],
  "Vitrectomy": ["retina"],
  "Intravitreal Injections": ["retina"],
  "Endophthalmitis": ["retina"],
  "Retinopathy of Prematurity": ["retina", "paediatric"],

  // Uveitis
  "Uveitis": ["uveitis"],
  "Uveitis, Anterior": ["uveitis"],
  "Uveitis, Posterior": ["uveitis"],
  "Uveitis, Intermediate": ["uveitis"],
  "Panuveitis": ["uveitis"],
  "Iridocyclitis": ["uveitis"],
  "Choroiditis": ["uveitis"],
  "Scleritis": ["uveitis"],
  "Uveomeningoencephalitic Syndrome": ["uveitis"],
  "Behcet Syndrome": ["uveitis"],

  // Neuro-ophthalmology
  "Optic Nerve": ["neuro"],
  "Optic Nerve Diseases": ["neuro"],
  "Optic Neuritis": ["neuro"],
  "Optic Neuropathy, Ischemic": ["neuro"],
  "Optic Atrophy": ["neuro"],
  "Papilledema": ["neuro"],
  "Pseudotumor Cerebri": ["neuro"],
  "Neuromyelitis Optica": ["neuro"],
  "Ocular Motility Disorders": ["neuro"],
  "Nystagmus, Pathologic": ["neuro"],
  "Hemianopsia": ["neuro"],
  "Visual Pathways": ["neuro"],

  // Oculoplastics and orbit
  "Eyelids": ["oculoplastics"],
  "Eyelid Diseases": ["oculoplastics"],
  "Blepharoptosis": ["oculoplastics"],
  "Blepharoplasty": ["oculoplastics"],
  "Ectropion": ["oculoplastics"],
  "Entropion": ["oculoplastics"],
  "Orbit": ["oculoplastics"],
  "Orbital Diseases": ["oculoplastics"],
  "Orbital Fractures": ["oculoplastics"],
  "Graves Ophthalmopathy": ["oculoplastics"],
  "Lacrimal Apparatus": ["oculoplastics"],
  "Lacrimal Apparatus Diseases": ["oculoplastics"],
  "Nasolacrimal Duct": ["oculoplastics"],
  "Dacryocystorhinostomy": ["oculoplastics"],

  // Paediatric ophthalmology and strabismus
  "Strabismus": ["paediatric"],
  "Esotropia": ["paediatric"],
  "Exotropia": ["paediatric"],
  "Amblyopia": ["paediatric"],
  "Hydrophthalmos": ["paediatric", "glaucoma"], // congenital glaucoma
  "Retinoblastoma": ["paediatric", "oncology"],

  // Ocular oncology
  "Eye Neoplasms": ["oncology"],
  "Uveal Neoplasms": ["oncology"],
  "Choroid Neoplasms": ["oncology"],
  "Retinal Neoplasms": ["oncology"],
  "Eyelid Neoplasms": ["oncology", "oculoplastics"],
  "Orbital Neoplasms": ["oncology", "oculoplastics"],
  "Conjunctival Neoplasms": ["oncology", "cornea"],
};

export function subspecialtiesForMesh(descriptors: readonly string[]): string[] {
  const ids = new Set<string>();
  for (const d of descriptors) for (const id of MESH_TO_SUBSPECIALTY[d] ?? []) ids.add(id);
  return ids.size > 0 ? [...ids] : ["general"];
}
