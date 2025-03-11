// components/ShareProfileCard.tsx
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Copy, Link2, Share2,  EyeOff, Clock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const ShareProfileCard = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [expiryOption, setExpiryOption] = useState('7days');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    if (!session) {
        toast.error('Not logged in', {
            description: 'You need to be logged in to share your profile',
          });
          return;
          }
          
          setIsLoading(true);
          try {
            const response = await axios.post('/api/reddit/create-share', {
              expiryOption,
              isAnonymous
            });
            
            setShareLink(response.data.shareUrl);
          } catch (error) {
            console.error('Error generating share link:', error);
            toast.error('Error', {
              description: 'Could not generate share link',
            });
          } finally {
            setIsLoading(false);
          }
          };
          
          const copyToClipboard = () => {
          if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            toast.success('Link copied!', {
              description: 'The share link has been copied to your clipboard',
            });
            
            // Reset copied status after a delay
            setTimeout(() => setCopied(false), 2000);
          }
          };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Reddit Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Hide Username</p>
            <p className="text-sm text-gray-500">
              {isAnonymous 
                ? "Your Reddit username will be hidden" 
                : "Your Reddit username will be visible"}
            </p>
          </div>
          <Switch 
            checked={isAnonymous} 
            onCheckedChange={setIsAnonymous}
          />
        </div>
        
        <div>
          <p className="font-medium mb-2">Link Expiration</p>
          <Select 
            value={expiryOption} 
            onValueChange={setExpiryOption}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7days">7 days</SelectItem>
              <SelectItem value="30days">30 days</SelectItem>
              <SelectItem value="never">Never expire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {shareLink && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Your Share Link</p>
            <div className="flex gap-2">
              <Input 
                value={shareLink} 
                readOnly 
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="mt-2 flex gap-2 items-center text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>
                {expiryOption === 'never' 
                  ? 'This link will never expire' 
                  : `This link will expire in ${
                      expiryOption === '24h' ? '24 hours' : 
                      expiryOption === '7days' ? '7 days' : 
                      '30 days'
                    }`
                }
              </span>
            </div>
            {isAnonymous && (
              <div className="mt-1 flex gap-2 items-center text-xs text-gray-500">
                <EyeOff className="h-3 w-3" />
                <span>Your Reddit username will not be visible</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!shareLink ? (
          <Button 
            onClick={generateShareLink}
            disabled={isLoading || !session}
            className="w-full"
          >
            <Link2 className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : 'Generate Share Link'}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => setShareLink(null)}
            className="w-full"
          >
            Create New Link
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ShareProfileCard;