"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader as UICardHeader, CardTitle as UICardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Trash2, FileText } from 'lucide-react'
import { getAgreementTemplates, createAgreementTemplate, deleteAgreementTemplate } from '@/lib/database'

interface AgreementTemplate {
  id: string
  name: string
  description: string
  body: string
}

export function AgreementTemplates() {
  const [templates, setTemplates] = useState<AgreementTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', body: '' })
  const [formError, setFormError] = useState('')
  const [viewTemplate, setViewTemplate] = useState<AgreementTemplate | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getAgreementTemplates()
      .then((data) => {
        setTemplates(data || [])
        setError(null)
      })
      .catch((err) => setError(err.message || 'Failed to load templates'))
      .finally(() => setLoading(false))
  }, [])

  const handleOpen = () => {
    setForm({ name: '', description: '', body: '' })
    setFormError('')
    setShowDialog(true)
  }

  const handleClose = () => {
    setShowDialog(false)
    setFormError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.body.trim()) {
      setFormError('Template name and body are required.')
      return
    }
    setSubmitting(true)
    try {
      const newTemplate = await createAgreementTemplate({
        name: form.name.trim(),
        description: form.description.trim(),
        body: form.body.trim(),
      })
      setTemplates([newTemplate, ...templates])
      setShowDialog(false)
      setFormError('')
    } catch (err: any) {
      setFormError(err.message || 'Failed to save template')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteAgreementTemplate(id)
      setTemplates(templates.filter(t => t.id !== id))
      if (viewTemplate?.id === id) setViewTemplate(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete template')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agreement Templates</h3>
          <p className="text-muted-foreground">Manage your consignment agreement templates here.</p>
        </div>
        <Button onClick={handleOpen} variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Template
        </Button>
      </div>

      {loading ? (
        <Card className="col-span-full">
          <CardContent className="py-8 text-center text-muted-foreground">Loading templates...</CardContent>
        </Card>
      ) : error ? (
        <Card className="col-span-full">
          <CardContent className="py-8 text-center text-red-500">{error}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                No agreement templates yet. Click "+ Add Template" to create one.
              </CardContent>
            </Card>
          )}
          {templates.map((template) => (
            <Card key={template.id}>
              <UICardHeader>
                <UICardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  {template.name}
                </UICardTitle>
                <CardDescription>{template.description}</CardDescription>
              </UICardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => setViewTemplate(template)}>
                  View
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)} disabled={deletingId === template.id}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deletingId === template.id ? 'Deleting...' : 'Delete'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Agreement Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Template Name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={submitting}
            />
            <Input
              name="description"
              placeholder="Short Description (optional)"
              value={form.description}
              onChange={handleChange}
              disabled={submitting}
            />
            <Textarea
              name="body"
              placeholder="Agreement Terms / Body..."
              value={form.body}
              onChange={handleChange}
              rows={8}
              required
              disabled={submitting}
            />
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>Cancel</Button>
              <Button type="submit" variant="default" disabled={submitting}>{submitting ? 'Saving...' : 'Save Template'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewTemplate} onOpenChange={() => setViewTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewTemplate?.name}</DialogTitle>
            <CardDescription>{viewTemplate?.description}</CardDescription>
          </DialogHeader>
          <div className="prose max-w-none whitespace-pre-wrap mt-4">
            {viewTemplate?.body}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewTemplate(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
 