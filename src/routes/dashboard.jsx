import Dashboard from '../Dashboard';
import UserList from '../UserList';
import ImportWizard from '../ImportWizard/ImportWizard';
import ReportsWizard from '../ReportsWizard';

var dashRoutes = [
    { path: "/dashboard", name: "ראשי", id: 1, icon: "fas fa-home", component: Dashboard },
    { path: "/dashboard/users", name: "משתמשים", id: 2, icon: "fas fa-users", component: UserList },
    { path: "/dashboard/import", name: "ייצוא", id: 3, icon: "fas fa-file-export", component: ImportWizard },
    { path: "/dashboard/reports", name: "דוחות", id: 4, icon: "fas fa-list-ul", component: ReportsWizard }
];
export default dashRoutes;
