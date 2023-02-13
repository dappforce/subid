import { FormInstance } from 'antd'

type FormFields = {
  sender: string
  amount: string
  currency: string
}

export const fieldName = (name: keyof FormFields) => name

export const setAndValidateField = (form: FormInstance, name: string, value?: string) => {
  form.setFields([ { name, value } ])
  form.validateFields([ name ]).catch(({ errorFields }) => {
    form.setFields(errorFields)
  })
}