/**
 * This data exists only for the approved Mess Management UI implementation.
 * Replace it with backend API data during the later integration phase.
 */

export interface MessSummaryCard {
  title: string;
  value: string;
  footer: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  tint: string;
}

export interface MealRow {
  id: string;
  meal: string;
  menu: string;
  time: string;
  status: "Served" | "Upcoming" | "Scheduled" | "Cancelled";
  iconColor: string;
  iconBg: string;
  mealIcon: string;
}

export interface MealServedSegment {
  label: string;
  count: number;
  percentage: string;
  color: string;
}

export interface ExpenseRow {
  id: string;
  date: string;
  particulars: string;
  category: string;
  amount: number;
  addedBy: string;
}

export interface CollectionRow {
  id: string;
  date: string;
  receivedFrom: string;
  blockRoom: string;
  amount: number;
  receivedBy: string;
}

export interface MessSummaryRow {
  label: string;
  value: string;
  icon: string;
  iconColor: string;
}

export interface ExpenseHeadRow {
  category: string;
  amount: string;
  amountNum: number;
  barWidth: number;
  barColor: string;
}

export interface QuickActionItem {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface WeeklyMenuDay {
  day: string;
  date: string;
  dayNum: number;
  monthNum: number;
  year: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  isCurrent: boolean;
}

export interface WeeklyMenuPlan {
  title: string;
  days: WeeklyMenuDay[];
}

export const MESS_SUMMARY_CARDS: MessSummaryCard[] = [
  {
    title: "Total Students",
    value: "286",
    footer: "In Mess",
    icon: "UtensilsCrossed",
    iconBg: "bg-purple-50",
    iconColor: "text-[#7c3aed]",
    tint: "bg-purple-50/60",
  },
  {
    title: "Meals Served Today",
    value: "856",
    footer: "Breakfast: 286 | Lunch: 286 | Dinner: 284",
    icon: "Users",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    tint: "bg-emerald-50/60",
  },
  {
    title: "Monthly Expenses",
    value: "₹ 2,45,780",
    footer: "October 2026",
    icon: "IndianRupee",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    tint: "bg-pink-50/60",
  },
  {
    title: "Monthly Collection",
    value: "₹ 2,62,500",
    footer: "October 2026",
    icon: "Wallet",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    tint: "bg-blue-50/60",
  },
  {
    title: "Balance",
    value: "₹ 16,720",
    footer: "October 2026",
    icon: "TrendingUp",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    tint: "bg-orange-50/60",
  },
];

export const TODAYS_MENU: MealRow[] = [
  {
    id: "1",
    meal: "Breakfast",
    menu: "Idli, Sambar, Coconut Chutney, Tea",
    time: "07:30 AM - 09:00 AM",
    status: "Served",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
    mealIcon: "Sun",
  },
  {
    id: "2",
    meal: "Lunch",
    menu: "Rice, Dal, Mixed Vegetable Curry, Curd, Salad",
    time: "12:30 PM - 02:00 PM",
    status: "Served",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    mealIcon: "Flame",
  },
  {
    id: "3",
    meal: "Dinner",
    menu: "Chapathi, Paneer Butter Masala, Rice, Salad",
    time: "07:30 PM - 09:00 PM",
    status: "Upcoming",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    mealIcon: "Moon",
  },
];

export const MEALS_SERVED_TODAY: MealServedSegment[] = [
  { label: "Breakfast", count: 286, percentage: "33.41%", color: "#7c3aed" },
  { label: "Lunch", count: 286, percentage: "33.41%", color: "#10b981" },
  { label: "Dinner", count: 284, percentage: "33.18%", color: "#f97316" },
];

export const MEALS_SERVED_TOTAL = 856;

export const RECENT_EXPENSES: ExpenseRow[] = [
  {
    id: "1",
    date: "02/10/2026",
    particulars: "Vegetables",
    category: "Groceries",
    amount: 2450,
    addedBy: "Admin",
  },
  {
    id: "2",
    date: "02/10/2026",
    particulars: "Milk & Dairy",
    category: "Milk & Dairy",
    amount: 1860,
    addedBy: "Admin",
  },
  {
    id: "3",
    date: "01/10/2026",
    particulars: "Rice (25kg)",
    category: "Groceries",
    amount: 1950,
    addedBy: "Admin",
  },
  {
    id: "4",
    date: "01/10/2026",
    particulars: "Cooking Oil (5L)",
    category: "Groceries",
    amount: 1250,
    addedBy: "Admin",
  },
  {
    id: "5",
    date: "01/10/2026",
    particulars: "LPG Cylinder",
    category: "LPG / Fuel",
    amount: 1180,
    addedBy: "Admin",
  },
];

export const RECENT_COLLECTIONS: CollectionRow[] = [
  {
    id: "1",
    date: "02/10/2026",
    receivedFrom: "Block A (Boys)",
    blockRoom: "Block A",
    amount: 8400,
    receivedBy: "Admin",
  },
  {
    id: "2",
    date: "02/10/2026",
    receivedFrom: "Block B (Boys)",
    blockRoom: "Block B",
    amount: 8400,
    receivedBy: "Admin",
  },
  {
    id: "3",
    date: "01/10/2026",
    receivedFrom: "Block C (Girls)",
    blockRoom: "Block C",
    amount: 8400,
    receivedBy: "Admin",
  },
  {
    id: "4",
    date: "01/10/2026",
    receivedFrom: "Block D (Girls)",
    blockRoom: "Block D",
    amount: 8400,
    receivedBy: "Admin",
  },
  {
    id: "5",
    date: "01/10/2026",
    receivedFrom: "Mess Advance (New)",
    blockRoom: "-",
    amount: 1000,
    receivedBy: "Admin",
  },
];

export const MESS_SUMMARY_ROWS: MessSummaryRow[] = [
  {
    label: "Total Students",
    value: "286",
    icon: "Users",
    iconColor: "text-[#7c3aed]",
  },
  {
    label: "Total Meals Served",
    value: "22,368",
    icon: "UtensilsCrossed",
    iconColor: "text-[#7c3aed]",
  },
  {
    label: "Total Collection",
    value: "₹ 2,62,500",
    icon: "Wallet",
    iconColor: "text-blue-600",
  },
  {
    label: "Total Expenses",
    value: "₹ 2,45,780",
    icon: "IndianRupee",
    iconColor: "text-pink-500",
  },
  {
    label: "Balance",
    value: "₹ 16,720",
    icon: "Wallet",
    iconColor: "text-emerald-600",
  },
];

export const TOP_EXPENSE_HEADS: ExpenseHeadRow[] = [
  { category: "Groceries", amount: "₹ 1,45,230", amountNum: 145230, barWidth: 100, barColor: "#7c3aed" },
  { category: "Vegetables", amount: "₹ 45,780", amountNum: 45780, barWidth: 31.5, barColor: "#10b981" },
  { category: "LPG / Fuel", amount: "₹ 22,450", amountNum: 22450, barWidth: 15.5, barColor: "#f97316" },
  { category: "Milk & Dairy", amount: "₹ 18,930", amountNum: 18930, barWidth: 13, barColor: "#3b82f6" },
  { category: "Others", amount: "₹ 13,390", amountNum: 13390, barWidth: 9.2, barColor: "#ec4899" },
];

export const MESS_QUICK_ACTIONS: QuickActionItem[] = [
  {
    label: "Add Menu",
    icon: "UtensilsCrossed",
    color: "text-[#7c3aed]",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    label: "Record Attendance",
    icon: "Users",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    label: "Add Expense",
    icon: "Receipt",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    label: "Collection Entry",
    icon: "Wallet",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    label: "Generate Report",
    icon: "FileText",
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
];

export const WEEKLY_MENU_PLAN: WeeklyMenuPlan = {
  title: "02 Oct - 08 Oct 2026",
  days: [
    {
      day: "Fri",
      date: "02 Oct",
      dayNum: 2,
      monthNum: 9,
      year: 2026,
      breakfast: "Paratha, Pickle, Tea",
      lunch: "Rice, Dal Fry, Sabji, Salad",
      dinner: "Chapathi, Aloo Gobi",
      isCurrent: true,
    },
    {
      day: "Sat",
      date: "03 Oct",
      dayNum: 3,
      monthNum: 9,
      year: 2026,
      breakfast: "Upma, Chutney, Tea",
      lunch: "Veg Biryani, Raita",
      dinner: "Chapathi, Kadai Paneer",
      isCurrent: false,
    },
    {
      day: "Sun",
      date: "04 Oct",
      dayNum: 4,
      monthNum: 9,
      year: 2026,
      breakfast: "Idli, Sambar, Tea",
      lunch: "Rice, Dal, Veg Curry",
      dinner: "Chapathi, Paneer Curry",
      isCurrent: false,
    },
    {
      day: "Mon",
      date: "05 Oct",
      dayNum: 5,
      monthNum: 9,
      year: 2026,
      breakfast: "Pongal, Chutney, Tea",
      lunch: "Jeera Rice, Rajma, Salad",
      dinner: "Chapathi, Mixed Veg",
      isCurrent: false,
    },
    {
      day: "Tue",
      date: "06 Oct",
      dayNum: 6,
      monthNum: 9,
      year: 2026,
      breakfast: "Upma, Chutney, Tea",
      lunch: "Rice, Sambar, Poriyal, Curd",
      dinner: "Chapathi, Dal Tadka",
      isCurrent: false,
    },
    {
      day: "Wed",
      date: "07 Oct",
      dayNum: 7,
      monthNum: 9,
      year: 2026,
      breakfast: "Poha, Tea",
      lunch: "Veg Pulao, Raita, Salad",
      dinner: "Chapathi, Chole",
      isCurrent: false,
    },
    {
      day: "Thu",
      date: "08 Oct",
      dayNum: 8,
      monthNum: 9,
      year: 2026,
      breakfast: "Idli, Sambar, Tea",
      lunch: "Lemon Rice, Curd, Salad",
      dinner: "Veg Noodles",
      isCurrent: false,
    },
  ],
};

export const MEAL_TYPE_OPTIONS = [
  "All Meals",
  "Breakfast",
  "Lunch",
  "Dinner",
];

export const MENU_TYPE_OPTIONS = [
  "All",
  "Regular",
  "Special",
  "Festival",
  "Diet",
];

export const BLOCK_FILTER_OPTIONS = [
  "All Blocks",
  "Block A",
  "Block B",
  "Block C",
  "Block D",
];

export const STATUS_FILTER_OPTIONS = [
  "All",
  "Served",
  "Upcoming",
  "Scheduled",
  "Cancelled",
];

export const MESS_BLOCK_OPTIONS = [
  "All Blocks",
  "Block A",
  "Block B",
  "Block C",
  "Block D",
];

export const ADD_MENU_MEAL_TYPE_OPTIONS = [
  "Breakfast",
  "Lunch",
  "Dinner",
];

export const ADD_MENU_MENU_TYPE_OPTIONS = [
  "Regular",
  "Special",
  "Festival",
  "Diet",
];

export const ADD_MENU_BLOCK_OPTIONS = [
  "All Blocks",
  "Block A",
  "Block B",
  "Block C",
  "Block D",
];

export const ADD_MENU_STATUS_OPTIONS = [
  "Scheduled",
  "Served",
  "Upcoming",
  "Cancelled",
];

export const MEAL_TIMEFRAME_OPTIONS = [
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
];
