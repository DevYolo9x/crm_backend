<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative">
      <h2 class="text-lg font-semibold mb-4">Chi tiết ứng viên {{ candidate?.full_name || '...' }}</h2>
      <Loading :loading="loading" />
      <div class="space-y-4" v-if="candidate">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input v-model="candidate.full_name" type="text" class="form-control" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input v-model="candidate.phone" type="text" class="form-control" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="candidate.email" type="email" class="form-control" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nhóm ngành nghề</label>
            <VueMultiselect v-model="selectedIndustry" :options="industries" :taggable="true" label="title" track-by="id" disabled placeholder="Chọn nhóm ngành nghề"></VueMultiselect>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Học vấn</label>
            <VueMultiselect v-model="selectedEducation" :options="educations" :taggable="true" label="name" track-by="id" disabled placeholder="Chọn học vấn"></VueMultiselect>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ngoại ngữ</label>
            <VueMultiselect v-model="selectedLanguage" :options="languages" :taggable="true" label="name" track-by="id" disabled placeholder="Chọn ngoại ngữ"></VueMultiselect>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chỗ ở hiện tại</label>
            <VueMultiselect v-model="selectedCurrentLocation" :options="provinces" :taggable="true" label="name" track-by="id" disabled placeholder="Chọn chỗ ở hiện tại"></VueMultiselect>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Khu vực mong muốn làm việc</label>
            <VueMultiselect v-model="selectedDesiredLocation" :options="provinces" :taggable="true" label="name" track-by="id" multiple disabled placeholder="Chọn khu vực"></VueMultiselect>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tóm tắt kinh nghiệm và nhận xét</label>
          <div v-html="candidate.experience_summary"></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5" v-if="candidate.cv_no_contact">
            <label class="block text-sm font-medium text-gray-700">File CV không có thông tin liên hệ</label>
            <a :href="candidate.cv_no_contact" download class="btn btn-primary !w-auto flex items-center float-left">
              <CloudDownloadIcon class="block h-6 w-6 text-white mr-1" />
              Tải xuống
            </a>
          </div>
          <div class="space-y-1.5" v-if="candidate.cv_with_contact">
            <label class="block text-sm font-medium text-gray-700">File CV có thông tin liên hệ</label>
            <a :href="candidate.cv_with_contact" download class="btn btn-primary !w-auto flex items-center float-left">
              <CloudDownloadIcon class="block h-6 w-6 text-white mr-1" />
              Tải xuống
            </a>
          </div>
        </div>
        <div class="flex justify-end space-x-2">
          <button @click="close" class="btn btn-danger !w-auto">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import VueMultiselect from 'vue-multiselect'
import { CloudDownloadIcon } from '@heroicons/vue/solid'
import axiosInstance from '../../axios'
import Loading from '../Loading.vue'

const props = defineProps({
  candidateId: {
    type: [Number, String],
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const store = useStore()
const candidate = ref(null)
const loading = ref(false)
const selectedIndustry = ref(null)
const selectedEducation = ref(null)
const selectedLanguage = ref(null)
const selectedCurrentLocation = ref(null)
const selectedDesiredLocation = ref(null)

const industries = computed(() => store.getters['industries/industryLists'] || [])
const educations = computed(() => store.getters['candidates/educations'] || [])
const languages = computed(() => store.getters['candidates/languages'] || [])
const provinces = computed(() => store.getters['candidates/provinces'] || [])

const fetchCandidate = async () => {
  if (!props.candidateId) return
  loading.value = true
  try {
    const { data } = await axiosInstance.get(`candidates/${props.candidateId}/show`)
    candidate.value = data.candidate

    // Gán giá trị cho các trường select
    selectedIndustry.value = industries.value.find((c) => c.id == data.candidate.industry_id) || null
    selectedEducation.value = educations.value.find((c) => c.id == data.candidate.education) || null
    selectedLanguage.value = languages.value.find((c) => c.id == data.candidate.language) || null
    selectedCurrentLocation.value = provinces.value.find((c) => c.id == data.candidate.current_location) || null
    const desiredLocationIds = data.candidate.desired_locations ? data.candidate.desired_locations.map((loc) => loc.location_id) : []
    console.log(data.desired_locations)
    selectedDesiredLocation.value = provinces.value.filter((p) => desiredLocationIds.includes(p.id)) || []
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết ứng viên:', error)
  } finally {
    loading.value = false
  }
}

const close = () => {
  candidate.value = null
  emit('close')
}

// Gọi API khi candidateId hoặc isVisible thay đổi
watch(
  () => props.candidateId,
  (newId) => {
    if (newId && props.isVisible) {
      fetchCandidate()
    }
  }
)
</script>
