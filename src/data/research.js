// Shared by the homepage and /research. Add only confirmed, public outputs.
const research = [
  {
    id: '3dgs-arap',
    status: 'ongoing',
    title: {
      zh: '3D Gaussian 表示的几何约束变形',
      en: 'Geometry-Constrained Deformation of 3D Gaussian Representations',
    },
    description: {
      zh: '探索将 As-Rigid-As-Possible（ARAP）约束用于 3D Gaussian 表示的变形，关注变形过程中的局部几何一致性。',
      en: 'Exploring As-Rigid-As-Possible (ARAP) constraints for deforming 3D Gaussian representations, with a focus on local geometric consistency during deformation.',
    },
    focus: [
      {zh: '3D Gaussian 场景的几何表示与变形。', en: 'Geometric representations and deformation of 3D Gaussian scenes.'},
      {zh: 'ARAP 约束与局部形状保持。', en: 'ARAP constraints and local shape preservation.'},
      {zh: '场景变形过程中的几何一致性。', en: 'Geometric consistency during scene deformation.'},
    ],
    tags: ['3D Gaussian Splatting', 'ARAP', 'Geometry'],
    links: [],
  },
];

// Future entries: {id, title, authors, venue, year, links: [{label: {zh, en}, href}]}.
export const publications = [];

export default research;
