import Dashboard from '../Dashboard';
import UserList from '../UserList';
import ImportWizard from '../ImportWizard';
import ReportsWizard from '../ReportsWizard';

var dashRoutes = [
    { path: "/dashboard", name: "Home", icon: "design_app", component: Dashboard },
    { path: "/dashboard/users", name: "Users", icon: "users_single-02", component: UserList },
    { path: "/dashboard/import", name: "Import", icon: "arrows-1_cloud-upload-94", component: ImportWizard },
    { path: "/dashboard/reports", name: "Reports", icon: "design_bullet-list-67", component: ReportsWizard }
];
export default dashRoutes;
