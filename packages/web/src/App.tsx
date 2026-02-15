import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Page from './pages/Page'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Booking from './pages/Booking'
import BookingConfirmation from './pages/BookingConfirmation'
import Products from './pages/Products'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="utbildningar" element={<Courses />} />
          <Route path="utbildningar/:slug" element={<CourseDetail />} />
          <Route path="utbildningar/:slug/boka" element={<Booking />} />
          <Route path="utbildningar/bekraftelse" element={<BookingConfirmation />} />
          <Route path="material" element={<Products />} />
          <Route path="nyhet" element={<Blog />} />
          <Route path="nyhet/:slug" element={<BlogPost />} />
          <Route path="kontakt" element={<Contact />} />
          <Route path=":slug" element={<Page />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
