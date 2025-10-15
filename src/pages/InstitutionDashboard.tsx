import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Removed unused Dialog imports
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import NewPatientModal from '@/components/NewPatientModal';
import { Link } from "react-router-dom";
import { buildSummaries, getDiseaseDistribution, getRiskDistribution } from '../lib/institutionData';
import { loadPatientsFromCsv } from '@/lib/csvLoader';
import { calculatePatientRisks } from '@/lib/predictions';

const basePatients = loadPatientsFromCsv();
console.log('Total patients loaded:', basePatients.length);
console.log('First patient sample:', basePatients[0]);

// Test risk calculation with a sample patient
if (basePatients.length > 0) {
  const testResult = calculatePatientRisks(basePatients[0]);
  console.log('Sample risk calculation:', testResult);
}

const summaries = buildSummaries(basePatients);
console.log('Sample summaries (first 3):', summaries.slice(0, 3));

const riskDistribution = getRiskDistribution(basePatients);
const diseaseDistribution = getDiseaseDistribution(basePatients);
// Profile Dropdown Menu (copied from PatientDashboard)
function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/signin';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        className="rounded-full bg-[linear-gradient(90deg,_#5170ff,_#ff66c4)] text-white font-semibold hover:opacity-90 px-4 py-2 h-10 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Profile
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          <Link to="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setIsOpen(false)}>
            Edit Profile
          </Link>
          <Link to="/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setIsOpen(false)}>
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function InstitutionDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [patients] = useState(summaries);
  const [displayCount, setDisplayCount] = useState(10);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setDisplayCount(10); // Reset to show first 10 when searching
  };

  const handleRiskFilterChange = (value: string) => {
    setFilterRisk(value);
    setDisplayCount(10); // Reset to show first 10 when filtering
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'all' ||
      (filterRisk === 'high' && patient.avgRisk >= 60) ||
      (filterRisk === 'medium' && patient.avgRisk >= 40 && patient.avgRisk < 60) ||
      (filterRisk === 'low' && patient.avgRisk < 40);
    return matchesSearch && matchesRisk;
  });

  const displayedPatients = filteredPatients.slice(0, displayCount);
  const hasMorePatients = filteredPatients.length > displayCount;

  const getRiskBadgeVariant = (risk: number) => {
    if (risk < 20) return 'default';
    if (risk < 40) return 'secondary';
    if (risk < 60) return 'default';
    return 'destructive';
  };

  
  return (
    <div>
      <div className="min-h-screen bg-background">
        {/* Modern OneCare Branding Header - match PatientDashboard */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full gradient-primary p-1">
                  <div className="rounded-full bg-card w-10 h-10 flex items-center justify-center overflow-hidden">
                    <video src="/assests/6.mp4" autoPlay loop muted className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-foreground">OneCare</span>
              </div>
              <div className="flex gap-2 items-center">
                <Button asChild className="rounded-full font-semibold px-4 py-2 h-10 flex items-center gap-2 text-white bg-[linear-gradient(90deg,_#5170ff,_#ff66c4)] hover:opacity-90" title="Insights">
                  <Link to="/institution/insights" className="flex items-center gap-2">Insights</Link>
                </Button>
                <Button asChild className="rounded-full font-semibold px-4 py-2 h-10 flex items-center gap-2 text-white bg-[linear-gradient(90deg,_#5170ff,_#ff66c4)] hover:opacity-90" title="Trends">
                  <Link to="/institution/trends" className="flex items-center gap-2">Trends</Link>
                </Button>
                {/* Profile Dropdown Menu */}
                <DropdownMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-card-foreground">{patients.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Risk Score</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-card-foreground">{(
                    patients.reduce((sum, p) => sum + p.avgRisk, 0) / Math.max(1, patients.length)
                  ).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Medium risk average
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Patients</CardTitle>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{
                    patients.filter((p) => p.avgRisk >= 60).length
                  }</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Require immediate attention
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Most Common</CardTitle>
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">
                    {diseaseDistribution.length > 0 ? diseaseDistribution[0].disease : 'No Data Available'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {diseaseDistribution.length > 0 ? `${diseaseDistribution[0].count} patients at risk` : 'No risk data'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-lg border bg-card shadow-sm bg-[#FAFAFA]">
            {/* Risk Distribution Pie Chart */}
            <Card className="bg-[#FAFAFA] border border-[#5170ff]">
              <CardHeader>
                <CardTitle className="font-bold text-primary">Risk Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Disease Distribution Bar Chart */}
            <Card className="bg-[#FAFAFA] border border-[#ff66c4]">
              <CardHeader>
                <CardTitle className="font-bold text-secondary">Patients by Disease Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diseaseDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="disease" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#0066CC" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Patient Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patient Records</CardTitle>
                <Button onClick={() => setIsNewPatientModalOpen(true)} className="gap-2 text-white bg-[linear-gradient(90deg,_#5170ff,_#ff66c4)] hover:opacity-90">
                  <Plus className="w-4 h-4" />
                  New Patient Screening
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRisk} onValueChange={handleRiskFilterChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Last Screening</TableHead>
                      <TableHead>Avg Risk</TableHead>
                      <TableHead>Top Risk Factor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedPatients.map((patient) => (
                      <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{patient.id}</TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.lastScreening}</TableCell>
                        <TableCell>
                          <Badge variant={getRiskBadgeVariant(patient.avgRisk) as any}>
                            {patient.avgRisk}%
                          </Badge>
                        </TableCell>
                        <TableCell>{patient.topRisk}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Load More Button */}
              {hasMorePatients && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => setDisplayCount(prev => prev + 10)}
                    className="gap-2 text-white bg-[linear-gradient(90deg,_#5170ff,_#ff66c4)] hover:opacity-90"
                  >
                    <Users className="w-4 h-4" />
                    Load More Patients ({filteredPatients.length - displayCount} remaining)
                  </Button>
                </div>
              )}

              {/* Patient Count Info */}
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Showing {displayedPatients.length} of {filteredPatients.length} patients
                {searchQuery && ` matching "${searchQuery}"`}
                {filterRisk !== 'all' && ` with ${filterRisk} risk`}
              </div>
            </CardContent>
          </Card>
        </div>

        <NewPatientModal
          isOpen={isNewPatientModalOpen}
          onClose={() => setIsNewPatientModalOpen(false)}
        />
      </div>
    </div>
  );
}
