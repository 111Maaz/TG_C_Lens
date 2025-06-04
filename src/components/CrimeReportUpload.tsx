import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Camera, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/use-toast';
import { useCreateCrime, useImageUpload } from '@/hooks/useCrimeData';
import { useAuth } from '@/auth/hooks/useAuth';

const crimeTypes = [
  { id: 'theft', label: 'Theft' },
  { id: 'burglary', label: 'Burglary' },
  { id: 'assault', label: 'Assault' },
  { id: 'robbery', label: 'Robbery' },
  { id: 'fraud', label: 'Fraud' },
  { id: 'vandalism', label: 'Vandalism' },
  { id: 'cybercrime', label: 'Cybercrime' },
  { id: 'public_nuisance', label: 'Public Nuisance' },
  { id: 'other', label: 'Other' },
];

const hyderabadRegions = [
  { id: 'hitech-city', label: 'HITEC City' },
  { id: 'banjara-hills', label: 'Banjara Hills' },
  { id: 'secunderabad', label: 'Secunderabad' },
  { id: 'old-city', label: 'Old City' },
  { id: 'gachibowli', label: 'Gachibowli' },
  { id: 'kukatpally', label: 'Kukatpally' },
  { id: 'jubilee-hills', label: 'Jubilee Hills' },
  { id: 'ameerpet', label: 'Ameerpet' },
  { id: 'begumpet', label: 'Begumpet' },
  { id: 'other', label: 'Other (specify in description)' },
];

// Form validation schema using Zod
const formSchema = z.object({
  crimeType: z.string({
    required_error: "Please select a crime type",
  }),
  location: z.string({
    required_error: "Please select a location",
  }),
  incidentDate: z.date({
    required_error: "Please select a date",
  }),
  incidentTime: z.string().optional(),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must not exceed 500 characters"),
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters"),
  image: z.any().optional(),
  anonymous: z.boolean().default(false),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const CrimeReportUpload: React.FC = () => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  const { mutateAsync: createCrime, isPending: isSubmitting } = useCreateCrime();
  const { mutateAsync: uploadImage, isPending: isUploading } = useImageUpload();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      incidentTime: '',
      description: '',
      address: '',
      anonymous: false,
      terms: false,
    },
  });

  // Handle file upload
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    form.setValue('image', file);
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit a report.",
          variant: "destructive",
        });
        return;
      }

      // Add animation for submission
      document.querySelector('form')?.classList.add('animate-pulse');
      setTimeout(() => document.querySelector('form')?.classList.remove('animate-pulse'), 1000);
      
      // First upload image if exists
      let imageUrl = null;
      if (data.image instanceof File) {
        const result = await uploadImage(data.image);
        imageUrl = result.url;
      }
      
      // Prepare crime data
      const crimeData = {
        type: data.crimeType,
        location: data.location,
        date: format(data.incidentDate, 'yyyy-MM-dd'),
        time: data.incidentTime || '',
        description: data.description,
        address: data.address,
        severity: 'medium', // Default severity, can be changed by admins
        status: 'open',
        imageUrl,
        reportedBy: data.anonymous ? null : user?.id,
        reporterEmail: data.anonymous ? null : user?.email,
        reporterName: data.anonymous ? null : user?.name,
        coordinates: [0, 0], // This would be replaced with geocoding
      };
      
      // Create crime report
      await createCrime(crimeData as any);
      
      // Show success animation
      toast({
        title: "Report submitted",
        description: "Your crime report has been submitted successfully!",
        variant: "default",
      });
      
      // Reset form
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Crime Report</CardTitle>
        <CardDescription>
          Help improve community safety by reporting incidents in your area. 
          All submissions are anonymized and moderated before being added to the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Crime Type */}
              <FormField
                control={form.control}
                name="crimeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crime Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crime type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {crimeTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hyderabadRegions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>{region.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Incident Date */}
              <FormField
                control={form.control}
                name="incidentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Incident</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Incident Time */}
              <FormField
                control={form.control}
                name="incidentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (approximate)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Location/Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} placeholder="Enter specific address or landmark" />
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Provide as much location detail as possible (street name, landmark, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what happened in detail. Include any relevant information that might help authorities."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide factual information and avoid speculation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <FormLabel>Evidence Image (Optional)</FormLabel>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex items-center gap-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  Upload Image
                </Button>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
                {imagePreview && (
                  <div className="relative w-16 h-16">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => {
                        setImagePreview(null);
                        form.setValue('image', undefined);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
              <FormDescription>
                Upload an image of the incident or evidence (max 5MB). Please ensure no faces or personal information are visible.
              </FormDescription>
            </div>

            {/* Anonymous Reporting */}
            <FormField
              control={form.control}
              name="anonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Submit Anonymously</FormLabel>
                    <FormDescription>
                      Your personal information will not be stored or shared.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Terms and Conditions */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormDescription>
                      I confirm that this report is accurate to the best of my knowledge and I understand that 
                      false reporting is a punishable offense.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Submit Report
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t pt-4">
        <div className="text-sm text-muted-foreground">
          <strong>Note:</strong> All reports are reviewed by our moderation team before being published. 
          Submitting false reports may lead to legal consequences.
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
          <a href="#" className="text-primary hover:underline">Emergency Contact Information</a>
          <a href="#" className="text-primary hover:underline">How Reports Are Used</a>
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CrimeReportUpload;
