
'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, PlusCircle, Search, X } from "lucide-react"

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  allTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  clearFilters: () => void;
}

export function ProductFilters({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  priceRange,
  setPriceRange,
  allTags,
  selectedTags,
  setSelectedTags,
  clearFilters
}: ProductFiltersProps) {

  const handleTagToggle = (tag: string) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const getSortLabel = () => {
    switch (sortOption) {
      case 'newest': return 'Newest';
      case 'oldest': return 'Oldest';
      case 'price-asc': return 'Price: Low to High';
      case 'price-desc': return 'Price: High to Low';
      default: return 'Sort by';
    }
  }

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (sortOption !== 'newest' ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0) +
    selectedTags.length;

  return (
    <div className="my-8 flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm md:flex-row md:items-center">
      <div className="relative w-full flex-1">
        <Input
          placeholder="Search for crafts..."
          className="rounded-full pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full">
              {getSortLabel()} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setSortOption('newest')}>Newest</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSortOption('oldest')}>Oldest</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSortOption('price-asc')}>Price: Low to High</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSortOption('price-desc')}>Price: High to Low</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-full">Price Range <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Price Range</h4>
                <p className="text-sm text-muted-foreground">
                  Select a minimum and maximum price.
                </p>
              </div>
              <p className="text-center font-medium">₹{priceRange[0]} - ₹{priceRange[1]}</p>
              <Slider
                defaultValue={[0, 10000]}
                min={0}
                max={10000}
                step={100}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
             <Button variant="outline" size="sm" className="h-9 rounded-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tags
              {selectedTags.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedTags.length}
                  </Badge>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Filter tags..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {allTags.map((tag) => (
                    <CommandItem
                      key={tag}
                      onSelect={() => handleTagToggle(tag)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedTags.includes(tag)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{tag}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-9 rounded-full px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
