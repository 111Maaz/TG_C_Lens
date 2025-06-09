import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { unofficialReportsService } from "@/services/unofficial-reports";

const crimeCategories = {
  "Bodily Crimes": [
    "Murder",
    "Attempt to Murder",
    "Assault",
    "Hurt",
    "Kidnapping",
    "Wrongful Restraint"
  ],
  "Crime Against Children": [
    "Child Labour",
    "Child Abuse",
    "Kidnapping of Minor",
    "Pocso Violation",
    "Neglect by Parents or Guardians"
  ],
  "Crime Against Women": [
    "Domestic Violence",
    "Dowry Harassment",
    "Rape",
    "Sexual Harassment",
    "Acid Attack",
    "Stalking"
  ],
  "Crime Against SC_ST": [
    "Caste-Based Abuse",
    "Atrocity under SC/ST Act",
    "Discrimination in Workplace",
    "Physical Assault due to Caste"
  ],
  "Economic Offence": [
    "Cheating",
    "Fraud",
    "Embezzlement",
    "Forgery",
    "Cyber Crime (Financial)",
    "Fake Currency"
  ],
  "Property Crime": [
    "Theft",
    "Burglary",
    "Robbery",
    "Extortion",
    "Criminal Trespass",
    "Arson"
  ]
};

const formSchema = z.object({
  crime_category: z.string().min(1, "Crime category is required"),
  crime_type: z.string().min(1, "Crime type is required"),
  district: z.string().min(1, "District is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  email: z.string().email("Invalid email address").optional().nullable(),
  is_anonymous: z.boolean().default(true),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  exact_location: z.string().min(1, "Location details are required"),
}).refine((data) => {
  // If not anonymous, email is required
  if (!data.is_anonymous && !data.email) {
    return false;
  }
  return true;
}, {
  message: "Email is required when not submitting anonymously",
  path: ["email"]
});

type FormValues = z.infer<typeof formSchema>;

const LocationPicker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export function UnofficialReportForm({ onClose }: { onClose: () => void }) {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableCrimeTypes, setAvailableCrimeTypes] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_anonymous: true,
    },
  });

  useEffect(() => {
    if (selectedCategory) {
      setAvailableCrimeTypes(crimeCategories[selectedCategory as keyof typeof crimeCategories] || []);
      form.setValue('crime_type', ''); // Reset crime type when category changes
    }
  }, [selectedCategory, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      await unofficialReportsService.create({
        crime_category: data.crime_category,
        crime_type: data.crime_type,
        district: data.district,
        description: data.description,
        exact_location: data.exact_location,
        email: data.email,
        is_anonymous: data.is_anonymous,
        location: {
          lat: data.location.lat,
          lng: data.location.lng,
        },
      });

      toast.success("Report submitted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to submit report. Please try again later.");
      console.error("Error submitting report:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="crime_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crime Category</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedCategory(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crime category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(crimeCategories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="crime_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Crime Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedCategory}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCategory ? "Select crime type" : "Select category first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCrimeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <FormControl>
                <Input placeholder="Enter district name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email {!form.watch('is_anonymous') && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e.target.value || null);
                    }}
                    disabled={form.watch('is_anonymous')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exact_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exact Location</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Detailed location or landmark" 
                    {...field} 
                    value={location ? `${location[0].toFixed(6)}, ${location[1].toFixed(6)}` : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <ScrollArea className="h-[150px] w-full rounded-md border">
                  <Textarea
                    placeholder="Provide details about the incident"
                    className="border-0"
                    {...field}
                  />
                </ScrollArea>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_anonymous"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel>Submit Anonymously</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Your identity will be kept private
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      form.setValue('email', null);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="h-[300px] w-full rounded-md border">
          <MapContainer
            center={[17.385044, 78.486671]} // Hyderabad coordinates
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker
              onLocationSelect={(lat, lng) => {
                setLocation([lat, lng]);
                form.setValue("location", { lat, lng });
                form.setValue("exact_location", `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
              }}
            />
            {location && <Marker position={location} />}
          </MapContainer>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit Report</Button>
        </div>
      </form>
    </Form>
  );
} 