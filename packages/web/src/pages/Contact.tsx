import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { submitContact } from '../lib/api'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Mail, Phone, User, CheckCircle2 } from 'lucide-react'

export default function Contact() {
  useDocumentTitle('Kontakt')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    },
    onError: (err: Error) => {
      setError(err.message || 'Något gick fel. Försök igen.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    mutation.mutate(formData)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tack för ditt meddelande!
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Vi återkommer till dig så snart som möjligt.
        </p>
        <Button variant="ghost" className="text-primary-600 font-medium" onClick={() => setSubmitted(false)}>
          Skicka ett nytt meddelande
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Kontakt</h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          Har du frågor om utbildningar eller vill diskutera ett samarbete?
          Hör av dig!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Kontaktuppgifter
          </h2>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="rounded-lg bg-primary-50 p-2.5">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-0.5">Fredrik Livheim</h3>
                  <p className="text-sm text-gray-500">
                    Legitimerad psykolog och ACT-utbildare
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="rounded-lg bg-primary-50 p-2.5">
                  <Mail className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-0.5">E-post</h3>
                  <a
                    href="mailto:livheim@gmail.com"
                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    livheim@gmail.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="rounded-lg bg-primary-50 p-2.5">
                  <Phone className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-0.5">Telefon</h3>
                  <a
                    href="tel:+46706940364"
                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    070-694 03 64
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Skicka meddelande</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn *</Label>
                  <Input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-post *</Label>
                  <Input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Ämne</Label>
                  <Input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Meddelande *</Label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Skickar...' : 'Skicka meddelande'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
