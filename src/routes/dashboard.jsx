import Dashboard from '../Dashboard';
import UserList from '../UserList';
import ImportWizard from '../ImportWizard';
import ReportsWizard from '../ReportsWizard';

var dashRoutes = [
    { path: "/dashboard", name: "Home", id: 1, icon: "design_app", component: Dashboard },
    { path: "/dashboard/users", name: "Users", id: 2, icon: "users_single-02", component: UserList },
    { path: "/dashboard/import", name: "Import", id: 3, icon: "arrows-1_cloud-upload-94", component: ImportWizard },
    { path: "/dashboard/reports", name: "Reports", id: 4, icon: "design_bullet-list-67", component: ReportsWizard }
];
export default dashRoutes;
