import ProjectCard from './components/projects'
import UsersCard from './components/users'
import ReportsCard from './components/reports'
import AnalyticsCard from './components/analytics'
import DashboardCharts from './components/DashboardCharts'

export default function Dashboard() {
  return (
    <div className="w-full">

      <h1 className="text-2xl font-bold mb-4">
        Welcome to Timetricx Admin
      </h1>

      {/* First Row - 4 Cards */}
      <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-4 
        gap-6 
        mb-6
      ">
        <div className="w-full">
          <UsersCard />
        </div>

        <div className="w-full">
          <ProjectCard />
        </div>

        <div className="w-full">
          <ReportsCard />
        </div>

        <div className="w-full">
          <AnalyticsCard />
        </div>
      </div>

      {/* Charts & Analytics Section */}
      <DashboardCharts />

    </div>
  )
}
