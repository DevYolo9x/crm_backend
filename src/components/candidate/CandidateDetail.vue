<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative max-h-[90vh] overflow-y-auto">
      <h2 class="text-lg font-semibold mb-4">Chi tiết ứng viên {{ candidate?.full_name[lang] || '...' }}</h2>
      <Loading :loading="loading" />
      <div class="space-y-4" v-if="candidate">
        
        <div class="tabs">
          <button
            v-for="l in Languages"
            :key="l.code"
            @click.prevent="lang = l.code"
            :class="{ 'bg-gray-100': lang === l.code }" class="cursor-pointer inline-block text-blue-600 hover:text-blue-700 rounded-t-lg py-3 px-4 text-sm font-medium text-center"
          >
            {{ l.name }}
          </button>
        </div>
        <div class="mt-0 border px-5 py-3 tab-content mb-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input v-model="candidate.full_name[lang]" type="text" class="form-control" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
              <input :value="formatDateDMY(candidate.birthday)" type="text" class="form-control" disabled />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
              <input v-model="candidate.gender[lang]" type="text" class="form-control" disabled />
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
              <VueMultiselect v-model="selectedIndustry" :multiple="true" :options="industries" :taggable="true" label="title" disabled :searchable="true" track-by="id" placeholder="Chọn nhóm ngành nghề"></VueMultiselect>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Học vấn</label>
              <VueMultiselect v-model="selectedEducation" :options="educations" :taggable="true" label="name" track-by="id" disabled placeholder="Chọn học vấn"></VueMultiselect>

            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngoại ngữ</label>
              <VueMultiselect v-model="selectedLanguage" :options="languageOptions" :taggable="true" label="name" track-by="id" disabled placeholder="Chọn ngoại ngữ"></VueMultiselect>
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


          <div class=" mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
                Kỹ năng
            </label>

            <div
              v-if="skills && skills[lang] && skills[lang].length"
              class="mb-3">
              <div class="">
                <div class="">
                  <div class="max-w-none mx-auto">
                    <div class="bg-white overflow-hidden sm:rounded-lg sm:shadow">
                      
                      <ul class="opacity-100">
                        <li v-for="(item, key) in skills[lang]" :key="key">
                            <div class="block hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out">
                              <div class="px-4 py-4 sm:px-6 border-t">
                                <div class="flex items-center justify-between">
                                  <div class="text-sm leading-5 font-medium text-indigo-600 truncate">
                                    {{ item?.name || '' }}
                                  </div>
                                </div>
                                <div class="mt-2 flex justify-between">
                                  <div class="sm:flex">
                                    <div class="mr-6 flex items-center text-sm leading-5 text-gray-500">
                                      <AcademicCapIcon class="w-4 h-4 mr-2" />
                                      {{ item?.description || '' }}
                                    </div>
                                  </div>
                                  
                                </div>
                              </div>
                              
                            </div>
                          </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-[14px] mt-2">- Đang cập nhật...</div>
          </div>

          <div class=" mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
                Quá trình học tập
            </label>
            <div
              v-if="timeEducation && timeEducation[lang] && timeEducation[lang].length"
              class="mb-3">
              <div class="bg-gray-100 p-4 rounded-[4px]">
                <ul role="list" class="my-2">
                  <li v-for="(item, key) in timeEducation[lang]" :key="key"
                    class="group relative flex flex-col pb-6 pl-7 last:pb-0 cursor-pointer"
                  >
                    <div class="absolute bottom-0 left-[calc(0.25rem-0.5px)] top-0 w-px bg-[#cdcdcd] group-first:top-3"></div>
                    <div class="absolute left-0 top-2 h-2 w-2 rounded-full border bg-zinc-950"></div>
                    <div class=" flex items-center justify-between text-sm">
                      <time class="font-display text-2xs/6 order-first font-semibold tracking-[0.1em]" datetime="2023-06-20T17:30-04:00">{{ item?.time || '' }}</time>
                    </div>
                    <p class="mt-0.5 text-sm/6 text-[#333]">{{ item?.school || '' }}</p>
                  </li>
                </ul>
              </div>
            </div>
            <div v-else class="text-[14px] mt-2">- Đang cập nhật...</div>
          </div>

          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Điểm mạnh</label>
            <div v-if="strength && strength[lang] != undefined && strength[lang] != ''" v-html="strength[lang]" class="text-[14px] p-4 flex flex-col justify-between gap-2 border rounded-lg shadow-md bg-white dark:bg-gray-700 dark:border-gray-400/40 mb-2"></div>
            <div v-else class="text-[14px] mt-2">- Đang cập nhật...</div>
          </div>

          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1"> Kinh nghệm làm việc </label>
            <div class="dark:bg-gray-800 w-full" v-if="workExperience && workExperience[lang] && workExperience[lang].length">
              <div class="flex flex-col justify-center mt-3 mb-3">
                <div class="gap-4 grid grid-cols-1">
                  <div v-for="(item, key) in workExperience[lang]" :key="key" class="p-4 flex flex-col justify-between gap-2 border rounded-lg shadow-md bg-white dark:bg-gray-700 dark:border-gray-400/40 text-[14px] mb-2">
                      <div class="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <span class="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600"><strong>Thời gian: </strong> {{ item?.time || '' }} </span>
                      </div>
                      <a class="dark:text-blue-100 font-semibold hover:underline text-blue-700 two-lines"><strong>Công ty: </strong> {{ item?.company || '' }} </a>
                      <p><strong>Vị trí: </strong> <span class="italic">{{ item?.position || '' }}</span> </p>
                      <div class="text-gray-800 two-lines dark:text-gray-300" v-html="item?.description || ''"></div>
                    </div>
                </div>
              </div>
            </div>
            <div v-else class="text-[14px] mt-2">- Đang cập nhật...</div>
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
  </div>
</template>

<script setup>
import { AcademicCapIcon } from '@heroicons/vue/solid'
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import VueMultiselect from 'vue-multiselect'
import { CloudDownloadIcon } from '@heroicons/vue/solid'
import axiosInstance from '../../axios'
import Loading from '../Loading.vue'
import { cloneDeep } from 'lodash'

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
const selectedIndustry = ref([])
const industry = ref([])
const educationList = ref([])
const selectedEducation = ref([])
const timeEducation = ref({})
const skills = ref({})
const selectedLanguage = ref(null)
const languageOptions = ref([])
const languageList = ref([])
const selectedCurrentLocation = ref(null)
const selectedDesiredLocation = ref(null)
const strength = ref({})
const workExperience = ref({})
const educations = ref([])

const industries = computed(() => store.getters['industries/industryLists'] || [])
const languages = computed(() => store.getters['candidates/languages'] || [])
const Languages = computed(() => store.getters['languages/languages'] || {})
const lang = ref('vi')
const provinces = computed(() => store.getters['candidates/provinces'] || [])

const allIndustries = computed(() => store.state.industries.industriesLang || {})
const allEducations = computed(() => store.state.candidates.educations || {})
const allLanguages = computed(() => store.state.candidates.languages || {})

/* START: Khi thay đổi ngôn ngữ tab */
watch(lang, async (newLang) => {
  industries.value = allIndustries.value[newLang]
  selectedIndustry.value = industry.value[newLang]
  educations.value = allEducations.value[newLang]
  selectedLanguage.value = languageList.value[newLang]
  languageOptions.value = allLanguages.value[newLang]
  selectedEducation.value = educationList.value[newLang]
})
/* END: Khi thay đổi ngôn ngữ tab */


const fetchCandidate = async () => {
  if (!props.candidateId) return
  loading.value = true
  try {
    const { data } = await axiosInstance.get(`candidates/${props.candidateId}/show`)
    candidate.value = data.candidate

    if (allIndustries.value && allIndustries.value[lang.value]) { // Nhóm ngành nghề theo Lang
      industries.value = allIndustries.value[lang.value]
    }
    if (allEducations.value && allEducations.value[lang.value]) { // Học vấn theo Lang
      educations.value = allEducations.value[lang.value]
    }
    console.log('Danh sách:', allEducations.value);
    if (allLanguages.value && allLanguages.value[lang.value]) { // Ngoại ngữ theo lang
      languageOptions.value = allLanguages.value[lang.value]
    }
    const clone = cloneDeep(candidate.value)
    selectedIndustry.value = clone?.industry_id?.[lang.value] || []
    industry.value = clone?.industry_id || []
    selectedLanguage.value = clone?.language?.[lang.value] || []
    languageList.value = clone?.language || []
    const desiredLocationIds = clone?.desired_locations?.map(loc => loc.location_id) || []
    selectedDesiredLocation.value = provinces.value.filter(p => desiredLocationIds.includes(p.id)) || []
    selectedCurrentLocation.value = provinces.value.find(
        p => p.id === clone?.current_location
    ) || null
    educationList.value = clone?.education || ''
    selectedEducation.value = clone?.education[lang.value] || {}
    strength.value = clone?.strength || {}
    workExperience.value = clone?.work_experience || {}
    timeEducation.value = clone?.time_education || {}
    skills.value = clone?.skills || {}
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

const formatDateDMY = (date) => {
  if (!date) return ''; // hoặc return 'Không có ngày';

  const d = new Date(date);
  if (isNaN(d)) return ''; // kiểm tra nếu date không hợp lệ

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
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

onMounted(async () => {
  await Promise.all([
    //store.dispatch('candidates/fetchProvinces'), 
    //store.dispatch('candidates/fetchConfigCandidate'), 
    store.dispatch('industries/fetchIndustryListsLang'),
    store.dispatch('candidates/fetchCandidates'),
    //store.dispatch('candidates/fetchConfigCandidate'),
  ])

})
</script>
