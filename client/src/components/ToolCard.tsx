import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Star } from "lucide-react";
import type { Tool, Category } from "@shared/schema";

interface ToolCardProps {
  tool: Tool & { category?: Category };
  onPurchase?: (toolId: string) => void;
}

export function ToolCard({ tool, onPurchase }: ToolCardProps) {
  const handlePurchase = (e: React.MouseEvent) => {
    e.preventDefault();
    onPurchase?.(tool.id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1" data-testid={`card-tool-${tool.id}`}>
      {/* Tool Image */}
      <div className="relative">
        <img 
          src={tool.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"} 
          alt={tool.name}
          className="w-full h-48 object-cover"
        />
        {tool.category && (
          <Badge className="absolute top-3 left-3" variant="secondary">
            {tool.category.name}
          </Badge>
        )}
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          <Eye className="w-3 h-3" />
          <span data-testid={`text-tool-views-${tool.id}`}>{tool.views}</span>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Tool Name */}
          <h3 className="text-xl font-bold line-clamp-2" data-testid={`text-tool-name-${tool.id}`}>
            {tool.name}
          </h3>
          
          {/* Description */}
          <p className="text-muted-foreground line-clamp-3" data-testid={`text-tool-description-${tool.id}`}>
            {tool.description}
          </p>
          
          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary" data-testid={`text-tool-price-${tool.id}`}>
              {Number(tool.price).toLocaleString('vi-VN')}₫
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
              <span>{Number(tool.rating).toFixed(1)} ({tool.reviewCount} đánh giá)</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handlePurchase}
              data-testid={`button-purchase-${tool.id}`}
            >
              Mua ngay
            </Button>
            <Link href={`/tools/${tool.id}`}>
              <Button variant="outline" size="sm" data-testid={`button-view-details-${tool.id}`}>
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
