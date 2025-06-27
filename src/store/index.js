import { createStore, createLogger } from 'vuex'
import dashboard from './modules/dashboard'
import auth from './modules/auth'
import sidebar from './modules/sidebar'
import system from './modules/system'
import roles from './modules/roles'
import user from './modules/user'
import customerGroups from './modules/customerGroups'
import customers from './modules/customers'
import jobs from './modules/jobs'
import activityLogs from './modules/activityLogs'
import industries from './modules/industries'
import candidates from './modules/candidates'
import contracts from './modules/contracts'
import candidateJobs from './modules/candidateJobs'
import languages from './modules/languages'
const debug = process.env.NODE_ENV !== 'production'
export default createStore({
    modules: {
        languages,
        dashboard,
        auth,
        sidebar,
        system,
        roles,
        user,
        customerGroups,
        customers,
        jobs,
        activityLogs,
        industries,
        candidates,
        contracts,
        candidateJobs,
    },
    strict: debug,
    plugins: debug ? [createLogger()] : [],
})
