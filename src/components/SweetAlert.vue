<script setup>
import Swal from 'sweetalert2'
import { watchEffect } from 'vue'

const props = defineProps({
    type: { type: String, default: 'success' }, // Các kiểu: success, error, warning, info, question
    title: { type: String, default: 'Thông báo' },
    text: { type: String, default: '' },
    show: { type: Boolean, required: true },
})

watchEffect(() => {
    if (props.show) {
        Swal.fire({
            title: props.title,
            text: props.text,
            icon: props.type,
            confirmButtonText: 'OK',
        })
    }
})
</script>
