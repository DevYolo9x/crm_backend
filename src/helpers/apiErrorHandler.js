import { useToastr } from '../plugins/toastr'
const toastr = useToastr()
export const handleApiError = (error) => {
    if (error.response?.data?.error) {
        toastr.error(error.response.data.error)
    } else if (error.response?.data?.errors) {
        const errorText = Object.values(error.response.data.errors).flat().join(' ')
        toastr.error(errorText.trim())
    } else {
        toastr.error(error.response?.data?.message || 'Có lỗi xảy ra!')
    }
}