/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableBonGovern = {
  path: '/bongovern',
  component: Layout,
  redirect: '/bongovern/datasets',
  name: 'Bon Govern',
  meta: {
    title: 'Bon Govern',
    icon: 'table'
  },
  children: [
    {
      path: 'datasets',
      component: () => import('@/views/bongovern/datasets/datasets'),
      name: 'Datasets',
      meta: { title: 'Datasets' }
    },
    {
      path: 'rcomptes',
      component: () => import('@/views/bongovern/rcomptes/rcomptes'),
      name: 'R. Comptes',
      meta: { title: 'R. Comptes' }
    },
    {
      path: 'ods',
      component: () => import('@/views/bongovern/ods/ods'),
      name: 'ODS',
      meta: { title: 'ODS' }
    },
    {
      path: 'regidors',
      component: () => import('@/views/bongovern/regidors/regidors'),
      name: 'Regidors',
      meta: { title: 'Regidors' }
    },
    {
      path: 'pressupostos',
      component: () => import('@/views/bongovern/pressupostos/pressupostos'),
      name: 'Pressupostos',
      meta: { title: 'Pressupostos' }
    },
    {
      path: 'govi',
      component: () => import('@/views/bongovern/govi/govi'),
      name: 'Govi',
      meta: { title: 'Govi' }
    },
    /*
    {
      path: 'analytics',
      component: () => import('@/views/bongovern/analytics/AnalyticsData'),
      name: 'Analytics',
      meta: { title: 'Analytics' }
    },
    */
    {
      path: 'ajustes-datasets',
      component: () => import('@/views/bongovern/ajustes-datasets/ajustes-datasets'),
      name: 'Ajustes',
      meta: { title: 'Ajustes' }
    }
    // Aquí eliminé la ruta duplicada
  ]
}
export default tableBonGovern

