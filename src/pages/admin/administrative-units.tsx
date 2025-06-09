import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Shield, Building2, ChevronRight, MapPin, Search, Building, Train } from "lucide-react";
import { cn } from "@/lib/utils";
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { SidebarWrapper } from "@/components/AppSidebar";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

// District data
const districtData = [
  { name: "Adilabad", reportedDirectly: true },
  { name: "Bhadradri Kothagudem", reportedDirectly: true },
  { name: "Mahabubabad", reportedDirectly: true },
  { name: "Ranga Reddy", reportedDirectly: false },
  { name: "Medchal-Malkajgiri", reportedDirectly: false },
  { name: "Jagtial", reportedDirectly: true },
  { name: "Jangaon", reportedDirectly: true },
  { name: "Jayashankar Bhupalpally", reportedDirectly: true },
  { name: "Jogulamba Gadwal", reportedDirectly: true },
  { name: "Kamareddy", reportedDirectly: true },
  { name: "Karimnagar", reportedDirectly: true },
  { name: "Khammam", reportedDirectly: true },
  { name: "Kumuram Bheem", reportedDirectly: true },
  { name: "Mahabubnagar", reportedDirectly: true },
  { name: "Mancherial", reportedDirectly: true },
  { name: "Medak", reportedDirectly: true },
  { name: "Mulugu", reportedDirectly: true },
  { name: "Nagarkurnool", reportedDirectly: true },
  { name: "Nalgonda", reportedDirectly: true },
  { name: "Narayanpet", reportedDirectly: true },
  { name: "Nirmal", reportedDirectly: true },
  { name: "Nizamabad", reportedDirectly: true },
  { name: "Peddapalli", reportedDirectly: true },
  { name: "Rajanna Sircilla", reportedDirectly: true },
  { name: "Sangareddy", reportedDirectly: true },
  { name: "Siddipet", reportedDirectly: true },
  { name: "Suryapet", reportedDirectly: true },
  { name: "Vikarabad", reportedDirectly: true },
  { name: "Wanaparthy", reportedDirectly: true },
  { name: "Warangal", reportedDirectly: true },
  { name: "Yadadri Bhuvanagiri", reportedDirectly: true },
];

// Districts not reported directly
const nonReportedDistricts = [
  { district: "Ranga Reddy", coveredBy: "Cyberabad, Rachakonda" },
  { district: "Medchal–Malkajgiri", coveredBy: "Cyberabad, Rachakonda" },
  { district: "Yadadri Bhuvanagiri", coveredBy: "Rachakonda" },
  { district: "Sangareddy (partial)", coveredBy: "Cyberabad" },
  { district: "Hyderabad (core city)", coveredBy: "Hyderabad Commissionerate" },
  { district: "Nalgonda (partial)", coveredBy: "Rachakonda" },
];

// Commissionerate data
const commissionerateData = [
  {
    name: "Cyberabad",
    icon: Shield,
    emoji: "🛡️",
    color: "from-blue-500/10 to-blue-600/10",
    districtsCovered: "Ranga Reddy, Medchal–Malkajgiri, parts of Sangareddy"
  },
  {
    name: "Rachakonda",
    icon: Building,
    emoji: "🏢",
    color: "from-purple-500/10 to-purple-600/10",
    districtsCovered: "Yadadri Bhuvanagiri, Medchal (partial), Nalgonda (partial)"
  },
  {
    name: "Hyderabad",
    icon: Building2,
    emoji: "🏢",
    color: "from-green-500/10 to-green-600/10",
    districtsCovered: "Hyderabad core district only"
  },
  {
    name: "CID",
    icon: Search,
    emoji: "🔍",
    color: "from-amber-500/10 to-amber-600/10",
    districtsCovered: "All districts — state-level investigations"
  },
  {
    name: "RP Secunderabad",
    icon: Train,
    emoji: "🚔",
    color: "from-red-500/10 to-red-600/10",
    districtsCovered: "Crime within railway stations, jurisdiction across multiple districts"
  }
];

// Summary data
const summaryData = [
  { 
    item: "Total Districts", 
    count: 33,
    icon: MapPin,
    color: "from-blue-100 to-blue-200"
  },
  { 
    item: "Direct Reports", 
    count: 26,
    icon: Shield,
    color: "from-green-100 to-green-200"
  },
  { 
    item: "Commissionerates", 
    count: 5,
    icon: Building2,
    color: "from-purple-100 to-purple-200"
  },
  { 
    item: "Covered Districts", 
    count: 10,
    icon: Shield,
    color: "from-amber-100 to-amber-200"
  },
];

const TimelineItem = ({ year, title, description }) => (
  <motion.div 
    variants={itemVariants}
    className="relative pl-8 pb-8 before:absolute before:left-[7px] before:top-2 before:h-full before:w-[2px] before:bg-indigo-200"
  >
    <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-indigo-500" />
    <h3 className="text-lg font-semibold text-indigo-700">{year}</h3>
    <h4 className="mt-1 font-medium text-gray-900">{title}</h4>
    <p className="mt-2 text-gray-600">{description}</p>
  </motion.div>
);

const StatCard = ({ item, count, icon: Icon, color }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      className="rounded-xl shadow-md p-6 bg-white/90 backdrop-blur-sm ring-1 ring-black/30 rounded-t-2xl"
    >
      <div className={cn(
        "flex items-center gap-3 p-2 rounded-lg mb-3",
        "bg-gradient-to-r",
        color
      )}>
        <Icon className="h-6 w-6 text-gray-700" />
        <h3 className="font-semibold text-gray-900">{item}</h3>
      </div>
      <div className="mt-2 text-3xl font-bold text-gray-900">
        {inView && <CountUp end={count} duration={2} />}
      </div>
    </motion.div>
  );
};

const CommissionerateCard = ({ name, icon: Icon, emoji, color, districtsCovered }) => (
  <motion.div
    variants={itemVariants}
    className={cn(
      "rounded-xl shadow-md p-6 h-full",
      "bg-white/90 backdrop-blur-sm",
      "hover:scale-105 hover:shadow-xl transition-all duration-300",
      "ring-1 ring-black/30 rounded-t-2xl"
    )}
  >
    <div className={cn(
      "flex items-center gap-3 mb-3 p-2 rounded-lg group",
      "bg-gradient-to-r",
      color
    )}>
      <div className="relative">
        <Icon className="h-6 w-6 text-gray-700 transition-all duration-300 group-hover:opacity-0" />
        <span className="absolute inset-0 text-xl opacity-0 transition-all duration-300 group-hover:opacity-100 transform group-hover:rotate-12">
          {emoji}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900">{name}</h3>
    </div>
    <p className="text-gray-600">{districtsCovered}</p>
  </motion.div>
);

const AdministrativeUnitsPage = () => {
  return (
    <SidebarWrapper>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative space-y-12"
      >
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.5, 0.8, 0.5],
            background: [
              "linear-gradient(to right, rgba(165,180,252,0.2), rgba(216,180,254,0.3), rgba(147,197,253,0.2))",
              "linear-gradient(to right, rgba(147,197,253,0.2), rgba(165,180,252,0.3), rgba(216,180,254,0.2))",
              "linear-gradient(to right, rgba(216,180,254,0.2), rgba(147,197,253,0.3), rgba(165,180,252,0.2))"
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            borderRadius: "1.5rem",
            filter: "blur(64px)"
          }}
        />

        {/* Overview Section */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-sm bg-white/90 shadow-lg rounded-2xl border-0 ring-1 ring-black/30 rounded-t-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Telangana officially has <span className="text-indigo-600 bg-indigo-50 px-2 rounded">33 revenue districts</span>, 
                but the Telangana Police's crime reporting system doesn't always align directly with these. Instead, crime data 
                is reported based on <span className="text-indigo-600 bg-indigo-50 px-2 rounded">police units or commissionerates</span>, 
                which may include multiple districts or only parts of them.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These include special zones like <span className="text-indigo-600 bg-indigo-50 px-2 rounded">Cyberabad, Rachakonda, 
                and Hyderabad</span>, as well as investigative or jurisdictional bodies such as CID and RP Secunderabad.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Historical Context Section */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-sm bg-white/90 shadow-lg rounded-2xl border-0 relative overflow-hidden ring-1 ring-black/30 rounded-t-2xl">
            {/* Background Map */}
            <div 
              className="absolute bottom-20 right-10 w-64 h-64 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'url("/section1.jpg")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'bottom right'
              }}
            />
            
            <CardHeader>
              <CardTitle className="text-2xl">Historical Evolution of Districts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="space-y-6">
                <TimelineItem
                  year="2014"
                  title="Telangana Formation"
                  description="The state began with 10 districts at the time of its formation."
                />
                <TimelineItem
                  year="2016"
                  title="Major Reorganization"
                  description="Expanded to 33 districts to improve administrative efficiency and bring governance closer to people."
                />
                <TimelineItem
                  year="Present"
                  title="Current Structure"
                  description="34 districts including the newly formed Hanumakonda, with special administrative zones for law enforcement."
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Districts Not Reported Section */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-sm bg-white/90 shadow-lg rounded-2xl border-0 ring-1 ring-black/30 rounded-t-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Districts & Commissionerates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Districts Not Reported Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Districts Not Reported Directly
                </h3>
                <div className="rounded-xl overflow-hidden border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Missing District</TableHead>
                        <TableHead>Covered By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nonReportedDistricts.map((item, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{item.district}</TableCell>
                          <TableCell>{item.coveredBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Commissionerates Grid */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Commissionerates Coverage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {commissionerateData.map((comm, index) => (
                    <CommissionerateCard key={index} {...comm} />
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-blue-500" />
                  Key Insight
                </h3>
                <p className="text-gray-700">
                  This structure ensures crime is monitored by functional policing units rather than just administrative district names. 
                  Even if a district doesn't appear by name in the dataset, its crime data is present under its respective commissionerate.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-6">Summary Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryData.map((item, index) => (
              <StatCard key={index} {...item} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </SidebarWrapper>
  );
};

export default AdministrativeUnitsPage; 