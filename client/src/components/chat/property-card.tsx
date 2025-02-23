import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{property.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
          <div>Price: ${property.price.toLocaleString()}</div>
          <div>Location: {property.location}</div>
          <div>Bedrooms: {property.bedrooms}</div>
          <div>Bathrooms: {property.bathrooms}</div>
        </div>
        <p className="text-sm text-muted-foreground">{property.description}</p>
      </CardContent>
    </Card>
  );
}
