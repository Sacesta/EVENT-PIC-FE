import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Type,
  Palette,
  Plus,
  Trash2,
  Upload,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface TextField {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

interface PDFTemplate {
  backgroundType: 'color' | 'image';
  backgroundColor: string;
  backgroundImage: string | null;
  textFields: TextField[];
  width: number;
  height: number;
}

const CustomizeTicketPDF = () => {
  const { eventId, ticketId } = useParams<{ eventId: string; ticketId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // PDF Template State
  const [template, setTemplate] = useState<PDFTemplate>({
    backgroundType: 'color',
    backgroundColor: '#ffffff',
    backgroundImage: null,
    textFields: [
      {
        id: '1',
        text: 'Event Name',
        x: 50,
        y: 50,
        fontSize: 32,
        fontFamily: 'Arial',
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      {
        id: '2',
        text: 'Ticket Type',
        x: 50,
        y: 100,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#333333',
        fontWeight: 'normal',
        textAlign: 'center'
      }
    ],
    width: 800,
    height: 400
  });

  const [selectedTextField, setSelectedTextField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Load event and ticket data
  useEffect(() => {
    const loadData = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const response = await apiService.getEvent(eventId);

        if (response.success && response.data) {
          setEvent(response.data);

          // Find the specific ticket
          const foundTicket = response.data.tickets?.find(
            (t: any) => t._id === ticketId || t.id === ticketId
          );

          if (foundTicket) {
            setTicket(foundTicket);

            // Load existing template if available
            if (foundTicket.pdfTemplate) {
              setTemplate(foundTicket.pdfTemplate);
            }
          }
        }
      } catch (error) {
        console.error('Error loading event:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId, ticketId, toast]);

  // Draw canvas
  useEffect(() => {
    drawCanvas();
  }, [template, selectedTextField, previewMode]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (template.backgroundType === 'color') {
      ctx.fillStyle = template.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (template.backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawTextFields(ctx);
      };
      img.src = template.backgroundImage;
      return;
    }

    drawTextFields(ctx);
  };

  const drawTextFields = (ctx: CanvasRenderingContext2D) => {
    template.textFields.forEach((field) => {
      ctx.font = `${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
      ctx.fillStyle = field.color;
      ctx.textAlign = field.textAlign;

      const x = field.textAlign === 'center' ? template.width / 2 : field.textAlign === 'right' ? template.width - 50 : field.x;
      ctx.fillText(field.text, x, field.y);

      // Draw selection border if selected and not in preview mode
      if (field.id === selectedTextField && !previewMode) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        const metrics = ctx.measureText(field.text);
        ctx.strokeRect(x - 5, field.y - field.fontSize, metrics.width + 10, field.fontSize + 10);
      }
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    setTemplate({ ...template, backgroundColor: color });
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setTemplate({
        ...template,
        backgroundType: 'image',
        backgroundImage: result
      });
    };
    reader.readAsDataURL(file);
  };

  const addTextField = () => {
    const newField: TextField = {
      id: Date.now().toString(),
      text: 'New Text',
      x: 50,
      y: 150 + (template.textFields.length * 40),
      fontSize: 18,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
      textAlign: 'left'
    };

    setTemplate({
      ...template,
      textFields: [...template.textFields, newField]
    });
    setSelectedTextField(newField.id);
  };

  const updateTextField = (id: string, updates: Partial<TextField>) => {
    setTemplate({
      ...template,
      textFields: template.textFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    });
  };

  const deleteTextField = (id: string) => {
    setTemplate({
      ...template,
      textFields: template.textFields.filter((field) => field.id !== id)
    });
    if (selectedTextField === id) {
      setSelectedTextField(null);
    }
  };

  const handleSave = async () => {
    if (!eventId || !ticketId) return;

    try {
      setSaving(true);

      // Save template to ticket
      const response = await apiService.updateTicketTemplate(eventId, ticketId, template);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'PDF template saved successfully',
        });
        navigate(`/event/${eventId}/manage`);
      } else {
        throw new Error(response.message || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save PDF template',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (previewMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Find clicked text field
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (const field of template.textFields) {
      ctx.font = `${field.fontWeight} ${field.fontSize}px ${field.fontFamily}`;
      const metrics = ctx.measureText(field.text);
      const fieldX = field.textAlign === 'center' ? template.width / 2 - metrics.width / 2 : field.textAlign === 'right' ? template.width - 50 - metrics.width : field.x;

      if (
        x >= fieldX - 5 &&
        x <= fieldX + metrics.width + 5 &&
        y >= field.y - field.fontSize &&
        y <= field.y + 10
      ) {
        setSelectedTextField(field.id);
        return;
      }
    }

    setSelectedTextField(null);
  };

  const selectedField = template.textFields.find((f) => f.id === selectedTextField);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <BackButton onClick={() => navigate(`/event/${eventId}/manage`)} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Customize Ticket PDF
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {event?.name} - {ticket?.title || ticket?.name || 'Ticket'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex-1 sm:flex-none"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Ticket Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <canvas
                    ref={canvasRef}
                    width={template.width}
                    height={template.height}
                    onClick={handleCanvasClick}
                    className="w-full border-2 border-border rounded-lg cursor-pointer bg-white dark:bg-gray-900"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  {!previewMode && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Click on text fields to edit them
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="background" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="background">Background</TabsTrigger>
                    <TabsTrigger value="text">Text</TabsTrigger>
                  </TabsList>

                  {/* Background Tab */}
                  <TabsContent value="background" className="space-y-4 mt-4">
                    <div>
                      <Label className="mb-2 block">Background Type</Label>
                      <Select
                        value={template.backgroundType}
                        onValueChange={(value: 'color' | 'image') =>
                          setTemplate({ ...template, backgroundType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="color">Solid Color</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {template.backgroundType === 'color' ? (
                      <div>
                        <Label className="mb-2 block">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={template.backgroundColor}
                            onChange={(e) => handleBackgroundColorChange(e.target.value)}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={template.backgroundColor}
                            onChange={(e) => handleBackgroundColorChange(e.target.value)}
                            className="flex-1"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label className="mb-2 block">Background Image</Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleBackgroundImageUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                        {template.backgroundImage && (
                          <div className="mt-2 relative">
                            <img
                              src={template.backgroundImage}
                              alt="Background preview"
                              className="w-full h-24 object-cover rounded border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setTemplate({ ...template, backgroundImage: null })
                              }
                              className="absolute top-1 right-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* Text Tab */}
                  <TabsContent value="text" className="space-y-4 mt-4">
                    <Button onClick={addTextField} className="w-full" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Text Field
                    </Button>

                    {selectedField ? (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold">Edit Text Field</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTextField(selectedField.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>

                        <div>
                          <Label className="mb-2 block">Text</Label>
                          <Input
                            value={selectedField.text}
                            onChange={(e) =>
                              updateTextField(selectedField.id, { text: e.target.value })
                            }
                            placeholder="Enter text"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="mb-2 block text-xs">Font Size</Label>
                            <Input
                              type="number"
                              value={selectedField.fontSize}
                              onChange={(e) =>
                                updateTextField(selectedField.id, {
                                  fontSize: parseInt(e.target.value) || 16
                                })
                              }
                              min={8}
                              max={72}
                            />
                          </div>

                          <div>
                            <Label className="mb-2 block text-xs">Color</Label>
                            <Input
                              type="color"
                              value={selectedField.color}
                              onChange={(e) =>
                                updateTextField(selectedField.id, { color: e.target.value })
                              }
                              className="h-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="mb-2 block">Font Family</Label>
                          <Select
                            value={selectedField.fontFamily}
                            onValueChange={(value) =>
                              updateTextField(selectedField.id, { fontFamily: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                              <SelectItem value="Courier New">Courier New</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                              <SelectItem value="Verdana">Verdana</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-2 block">Font Weight</Label>
                          <Select
                            value={selectedField.fontWeight}
                            onValueChange={(value: 'normal' | 'bold') =>
                              updateTextField(selectedField.id, { fontWeight: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-2 block">Text Align</Label>
                          <Select
                            value={selectedField.textAlign}
                            onValueChange={(value: 'left' | 'center' | 'right') =>
                              updateTextField(selectedField.id, { textAlign: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-2 block">Position Y</Label>
                          <Slider
                            value={[selectedField.y]}
                            onValueChange={([value]) =>
                              updateTextField(selectedField.id, { y: value })
                            }
                            min={20}
                            max={template.height - 20}
                            step={1}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedField.y}px
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Click on a text field to edit it</p>
                      </div>
                    )}

                    {/* Text Fields List */}
                    {template.textFields.length > 0 && (
                      <div className="mt-4">
                        <Label className="mb-2 block">Text Fields</Label>
                        <div className="space-y-2">
                          {template.textFields.map((field) => (
                            <button
                              key={field.id}
                              onClick={() => setSelectedTextField(field.id)}
                              className={`w-full p-2 text-left rounded border transition-colors ${
                                selectedTextField === field.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <p className="text-sm font-medium truncate">{field.text}</p>
                              <p className="text-xs text-muted-foreground">
                                {field.fontSize}px • {field.fontFamily}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeTicketPDF;
