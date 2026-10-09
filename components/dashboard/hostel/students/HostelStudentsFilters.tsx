"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/shared/Dropdown";
import { Button } from "@/components/ui/button";
const DEFAULT_BLOCK_OPTIONS = ["All Blocks"];
const DEFAULT_ROOM_OPTIONS = ["All Rooms"];
const GENDER_OPTIONS = ["All", "Male", "Female"];
const DEFAULT_CLASS_OPTIONS = ["All Classes"];
const STATUS_OPTIONS = ["All Status", "Active", "Inactive", "Checked Out"];

interface HostelStudentsFiltersProps {
  block: string;
  onBlockChange: (value: string) => void;
  blockOptions?: string[];
  room: string;
  onRoomChange: (value: string) => void;
  roomOptions?: string[];
  gender: string;
  onGenderChange: (value: string) => void;
  classSection: string;
  onClassSectionChange: (value: string) => void;
  classOptions?: string[];
  status: string;
  onStatusChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onFilter: () => void;
  onReset: () => void;
}

export default function HostelStudentsFilters({
  block,
  onBlockChange,
  blockOptions = DEFAULT_BLOCK_OPTIONS,
  room,
  onRoomChange,
  roomOptions = DEFAULT_ROOM_OPTIONS,
  gender,
  onGenderChange,
  classSection,
  onClassSectionChange,
  classOptions = DEFAULT_CLASS_OPTIONS,
  status,
  onStatusChange,
  search,
  onSearchChange,
  onFilter,
  onReset,
}: HostelStudentsFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
      <div className="flex flex-col xl:flex-row xl:items-end gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Dropdown
            label="Hostel Block"
            value={block}
            options={blockOptions}
            onChange={onBlockChange}
          />
          <Dropdown label="Room No." value={room} options={roomOptions} onChange={onRoomChange} />
          <Dropdown label="Gender" value={gender} options={GENDER_OPTIONS} onChange={onGenderChange} />
          <Dropdown
            label="Class / Section"
            value={classSection}
            options={classOptions}
            onChange={onClassSectionChange}
          />
          <Dropdown label="Status" value={status} options={STATUS_OPTIONS} onChange={onStatusChange} />
        </div>

        <div className="flex-1 xl:max-w-xs">
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Search Student
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, roll no., admission no..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onFilter}
            className="inline-flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg h-9 px-4 text-sm font-semibold"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 4h18l-6 8-4-4-5 6v4h18" />
            </svg>
            Filter
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            className="inline-flex items-center gap-2 border-purple-200 text-[#7c3aed] hover:bg-purple-50 rounded-lg h-9 px-4 text-sm font-semibold"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
              <path d="M21 3v6h-6" />
            </svg>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
