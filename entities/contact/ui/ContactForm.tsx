"use client"

import React, { useState } from "react"
import styles from "./ContactForm.module.css"

const initialState = {
  name: "",
  email: "",
  address: "",
  message: "",
  category: "",
  file: null as File | null,
}

const categories = [
  { value: "", label: "Выберите категорию" },
  { value: "complaint", label: "Жалоба" },
  { value: "suggestion", label: "Предложение" },
  { value: "request", label: "Запрос информации" },
]

export default function ContactForm() {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState<any>({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const newErrors: any = {}
    if (!form.name.trim()) newErrors.name = "Укажите ФИО"
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = "Введите корректный email"
    if (!form.address.trim()) newErrors.address = "Укажите адрес проживания"
    if (!form.message.trim()) newErrors.message = "Опишите суть обращения"
    return newErrors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, file: e.target.files ? e.target.files[0] : null }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      setSubmitted(true)
      // Здесь можно добавить отправку данных на сервер или email
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.heading}>Обратная связь</h2>
      <div className={styles.fieldGroup}>
        <label htmlFor="name">ФИО*</label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className={errors.name ? styles.errorInput : ""}
          placeholder="Введите ФИО"
          required
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="email">Адрес электронной почты*</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={errors.email ? styles.errorInput : ""}
          placeholder="example@email.com"
          required
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="address">Адрес проживания (места пребывания)*</label>
        <input
          type="text"
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
          className={errors.address ? styles.errorInput : ""}
          placeholder="Город, улица, дом, квартира"
          required
        />
        {errors.address && <span className={styles.error}>{errors.address}</span>}
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="category">Категория обращения</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="file">Документ (при необходимости)</label>
        <input
          type="file"
          id="file"
          name="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="message">Суть обращения*</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          className={errors.message ? styles.errorInput : ""}
          placeholder="Опишите вашу проблему, вопрос или предложение"
          rows={5}
          required
        />
        {errors.message && <span className={styles.error}>{errors.message}</span>}
      </div>
      <button type="submit" className={styles.submitBtn}>Отправить</button>
      {submitted && <div className={styles.successMsg}>Спасибо! Ваше обращение отправлено.</div>}
    </form>
  )
} 