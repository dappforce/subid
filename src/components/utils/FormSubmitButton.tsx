import { Form, FormInstance } from 'antd'
import React from 'react'

export type FormSubmitButtonProps = {
  form?: FormInstance
  mustAllFieldsTouched?: boolean
  requiredTouchedFields?: string[]
  children: (disabled: boolean, form: FormInstance) => JSX.Element
}

export default function FormSubmitButton ({ form, requiredTouchedFields, children }: FormSubmitButtonProps) {
  return (
    <Form.Item
      noStyle
      shouldUpdate
    >
      {(innerForm) => {
        const usedForm = form || innerForm as FormInstance
        const values = usedForm.getFieldsValue()
        let hasAnyEmptyAndUntouchedFields = false
        if (requiredTouchedFields) {
          for (let i = 0; i < requiredTouchedFields.length; i++) {
            const fieldName = requiredTouchedFields[i]

            const isEmptyAndUntouched = !usedForm.isFieldTouched(fieldName) && !values[fieldName]
            hasAnyEmptyAndUntouchedFields = hasAnyEmptyAndUntouchedFields || isEmptyAndUntouched
            if (isEmptyAndUntouched) break
          }
        }

        const errorFields = usedForm.getFieldsError().filter(({ errors }) => errors.length > 0)
        const isDisabled = hasAnyEmptyAndUntouchedFields || errorFields.length > 0 || !values['recipient']
          
        return children(isDisabled, usedForm)
      }}
    </Form.Item>
  )
}