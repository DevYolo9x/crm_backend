<template>
  <div class="flex flex-col space-y-2.5">
    <nav class="flex text-gray-70" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <li class="inline-flex items-center">
          <router-link :to="{ name: 'Dashboard' }" class="text-sm font-medium hover:text-blue-600">Tổng quan</router-link>
        </li>
        <li>
          <div class="flex items-center">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <router-link :to="{ name: 'Candidates' }" class="text-sm font-medium hover:text-blue-600 md:ml-2">Quản lý ứng viên</router-link>
          </div>
        </li>
        <li>
          <div class="flex items-center">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">{{ route.meta.title }}</span>
          </div>
        </li>
      </ol>
    </nav>

    <Loading :loading="loading" />
    <Title :title="route.meta.title" class="flex-1" />

    <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Tabs hoặc lựa chọn ngôn ngữ -->
          <div>
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
            <!-- Tab content -->
             <div class="border px-5 py-3 tab-content mb-3">
                <!-- Thông tin Form: Họ tên, Email... -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên ({{ lang.toUpperCase() }})
                      <span class="text-red-600">*</span>
                    </label>
                    <input v-model="currentFullName" type="text" @keydown.enter.prevent class="form-control" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                      <span class="text-red-600">*</span>
                    </label>
                    <Datepicker v-model="currentBirthday" class="form-control" :format="formatDate" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                      <span class="text-red-600">*</span>
                    </label>
                    <input v-model="currentGender" type="text" @keydown.enter.prevent class="form-control" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                      <span class="text-red-600">*</span>
                      <span v-if="validationErrors.phoneExists" class="text-red-600 text-[12px] ml-1">{{ validationMessageErrors.phoneExists }}</span>
                    </label>
                    <input v-model="currentPhone" type="text" @keydown.enter.prevent class="form-control" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Email
                      <span class="text-red-600">*</span>
                      <span v-if="validationErrors.emailExists" class="text-red-600 text-[12px] ml-1">{{ validationMessageErrors.emailExists }}</span>
                    </label>
                    <input v-model="currentEmail" type="email" @keydown.enter.prevent class="form-control" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Nhóm ngành nghề
                      <span class="text-red-600">*</span>
                    </label>
                    <VueMultiselect v-model="currentIndustry" :multiple="true" :options="industries" :taggable="true" label="title" :searchable="true" track-by="id" placeholder="Chọn nhóm ngành nghề"></VueMultiselect>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Học vấn</label>
                    <VueMultiselect v-model="currentEducation" :options="educations" :taggable="true" label="name" :searchable="true" track-by="id" placeholder="Chọn học vấn"></VueMultiselect>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ngoại ngữ</label>
                    <VueMultiselect v-model="currentLanguage" :options="languageOptions" :taggable="true" label="name" :searchable="true" track-by="id" placeholder="Chọn ngoại ngữ"></VueMultiselect>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Chỗ ở hiện tại
                      <span class="text-red-600">*</span>
                    </label>
                    <VueMultiselect v-model="currentLocation" :options="provinces" :taggable="true" label="name" :searchable="true" track-by="id" @select="onCurrentLocationChange" placeholder="Chọn chỗ ở hiện tại"></VueMultiselect>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Khu vực mong muốn làm việc
                      <span class="text-red-600">*</span>
                    </label>
                    <VueMultiselect v-model="currentDesiredLocation" :options="provinces" :taggable="true" label="name" :searchable="true" track-by="id" @select="onDesiredLocationChange" multiple placeholder="Chọn"></VueMultiselect>
                  </div>
                </div>

                <!-- Quá trình học tập -->
                <div class=" mt-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                      Quá trình học tập
                  </label>
                  <div
                    v-if="timeEducation && timeEducation[lang] && timeEducation[lang].length"
                    class="mb-3"
                  >
                    <div class="bg-gray-100 p-4 rounded-[4px]">
                      <ul role="list" class="my-2">
                        <draggable
                          v-model="timeEducation[lang]"
                          item-key="id"
                          tag="ul"
                        >
                          <template #item="{ element: item, index: key }">
                            <li
                              class="group relative flex flex-col pb-6 pl-7 last:pb-0 cursor-pointer"
                            >
                              <div class="absolute bottom-0 left-[calc(0.25rem-0.5px)] top-0 w-px bg-[#cdcdcd] group-first:top-3"></div>
                              <div class="absolute left-0 top-2 h-2 w-2 rounded-full border bg-zinc-950"></div>
                              <div class=" flex items-center justify-between text-sm">
                                <time class="font-display text-2xs/6 order-first font-semibold tracking-[0.1em]" datetime="2023-06-20T17:30-04:00">{{ item.time }}</time>
                                <div >
                                  <button @click.prevent="editItemTimeEducation(key)" class="text-blue-700 hover:underline dark:text-white">Chỉnh sửa</button>
                                  <span class="mx-2">|</span>
                                  <button @click.prevent="removeItemTimeEducation(key)" class="text-blue-700 hover:underline dark:text-white">Xoá</button>
                                </div>
                              </div>
                              <p class="mt-0.5 text-sm/6 text-[#333]">{{ item.school }}</p>
                            </li>
                          </template>
                        </draggable>
                      </ul>
                    </div>
                  </div>

                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-4">
                      <input type="text" v-model="currentTimeEducation.time" class="form-control" placeholder="Thời gian *">
                    </div>
                    <div class="col-span-8">
                      <textarea type="text" v-model="currentTimeEducation.school" class="form-control" placeholder="Mô tả *"></textarea>
                    </div>
                  </div>
                  
                  <button v-if="selectedIndexTimeEducation == null" @click.prevent="addItemTimeEducation" :disabled="!currentTimeEducation.time || !currentTimeEducation.school" class="disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 mt-2 px-3 py-1 text-[12px] text-white">Thêm quá trình +</button>
                  
                  <!-- Nếu đã chọn item: Cập nhật -->
                  <button v-if="selectedIndexTimeEducation != null" @click.prevent="updateTimeEducation" class="bg-blue-600 mt-2 px-3 py-1 text-[12px] text-white">
                    Cập nhật
                  </button>
                  <button v-if="selectedIndexTimeEducation != null" @click.prevent="existTimeEducation" class="bg-red-500 mt-2 px-3 py-1 text-[12px] text-white ml-2">
                    Huỷ
                  </button>
                </div>

                <!-- Kỹ năng -->
                <div class=" mt-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                      Kỹ năng
                  </label>

                  <div
                    v-if="skills && skills[lang] && skills[lang].length"
                    class="mb-3"
                  >
                    <div class="">
                      <div class="">
                        <div class="max-w-none mx-auto">
                          <div class="bg-white overflow-hidden sm:rounded-lg sm:shadow">
                            
                            <ul class="opacity-100">
                              <draggable
                                v-model="skills[lang]"
                                item-key="id"
                                tag="ul"
                              >
                                <template #item="{ element: item, index: key }">
                                  <li>
                                    <div class="block hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out">
                                      <div class="px-4 py-4 sm:px-6 border-t">
                                        <div class="flex items-center justify-between">
                                          <div class="text-sm leading-5 font-medium text-indigo-600 truncate">
                                            {{ item.name }}
                                          </div>
                                          <div class="ml-2 flex-shrink-0 flex text-sm">
                                            <div >
                                              <button @click.prevent="editItemSkill(key)" class="text-blue-700 hover:underline dark:text-white">Chỉnh sửa</button>
                                              <span class="mx-2">|</span>
                                              <button @click.prevent="removeItemSkill(key)" class="text-blue-700 hover:underline dark:text-white">Xoá</button>
                                            </div>
                                          </div>
                                        </div>
                                        <div class="mt-2 flex justify-between">
                                          <div class="sm:flex">
                                            <div class="mr-6 flex items-center text-sm leading-5 text-gray-500">
                                              <AcademicCapIcon class="w-4 h-4 mr-2" />
                                              {{ item.description }}
                                            </div>
                                          </div>
                                          
                                        </div>
                                      </div>
                                      
                                    </div>
                                  </li>
                                </template>
                              </draggable>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-4">
                      <input type="text" v-model="currentSkills.name" class="form-control" placeholder="Tên kỹ năng">
                    </div>
                    <div class="col-span-8">
                      <textarea type="text" v-model="currentSkills.description" class="form-control" placeholder="Mô tả"></textarea>
                    </div>
                  </div>
                  
                  <button v-if="selectedIndexSkill == null" @click.prevent="addItemSkills" :disabled="!currentSkills.name || !currentSkills.description" class="disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 mt-2 px-3 py-1 text-[12px] text-white">Thêm kỹ năng +</button>
                  
                  <!-- Nếu đã chọn item: Cập nhật -->
                  <button v-if="selectedIndexSkill != null" @click.prevent="updateSkill" class="bg-blue-600 mt-2 px-3 py-1 text-[12px] text-white">
                    Cập nhật
                  </button>
                  <button v-if="selectedIndexSkill != null" @click.prevent="existSkill" class="bg-red-500 mt-2 px-3 py-1 text-[12px] text-white ml-2">
                    Huỷ
                  </button>
                </div>

                <!-- Điểm mạnh -->
                <div class="mt-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Điểm mạnh</label>
                  <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="currentStrength" contentType="html" :key="lang" />
                </div>

                <!-- Kinh nghiệm làm việc -->
                <div class="mt-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1"> Kinh nghệm làm việc </label>
                  <div class="dark:bg-gray-800 w-full" v-if="workExperience && workExperience[lang] && workExperience[lang].length">
                    <div class="flex flex-col justify-center mt-3 mb-3">
                      <div class="gap-4 grid grid-cols-1">
                        <draggable
                          v-model="workExperience[lang]"
                          item-key="id"
                          tag="ul"
                        >
                          <template #item="{ element: item, index: key }">
                            <div class="p-4 flex flex-col justify-between gap-2 border rounded-lg shadow-md bg-white dark:bg-gray-700 dark:border-gray-400/40 text-[14px] mb-2">
                              <div class="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <span class="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600"><strong>Thời gian: </strong> {{ item.time }} </span>
                              </div>
                              <a class="dark:text-blue-100 font-semibold hover:underline text-blue-700 two-lines"><strong>Công ty: </strong> {{ item.company }} </a>
                              <p><strong>Vị trí: </strong> <span class="italic">{{ item.position }}</span> </p>
                              <div class="text-gray-800 two-lines dark:text-gray-300" v-html="item.description"></div>
                              <div class="flex items-center justify-end text-sm">
                                <button @click.prevent="editItemExperience(key)" class="text-blue-700 hover:underline dark:text-white">Chỉnh sửa</button>
                                <span class="mx-2">|</span>
                                <button @click.prevent="removeItemExperience(key)" class="text-blue-700 hover:underline dark:text-white">Xoá</button>
                              </div>
                            </div>
                          </template>
                      </draggable>
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-4">
                      <input type="text" v-model="currentWorkExperience.time" class="form-control" placeholder="Thời gian *">
                    </div>
                    <div class="col-span-4">
                      <input type="text" v-model="currentWorkExperience.company" class="form-control" placeholder="Công ty *">
                    </div>
                    <div class="col-span-4">
                      <input type="text" v-model="currentWorkExperience.position" class="form-control" placeholder="Vị trí *">
                    </div>
                  </div>
                  <div class="mt-3">
                    <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="currentWorkExperience.description" contentType="html" :key="lang" />
                  </div>

                  <!-- Nếu chưa chọn gì: Thêm -->
                  <button
                    v-if="selectedIndexWorkExperience == null"
                    @click.prevent="addWorkExperience"
                    class="bg-blue-600 mt-2 px-3 py-1 text-[12px] text-white"
                  >
                    Thêm kinh nghiệm +
                  </button>
                  
                  <!-- Nếu đã chọn item: Cập nhật -->
                  <button v-if="selectedIndexWorkExperience != null" @click.prevent="updateWorkExperience" class="bg-blue-600 mt-2 px-3 py-1 text-[12px] text-white">
                    Cập nhật
                  </button>
                  <button v-if="selectedIndexWorkExperience != null" @click.prevent="existWorkExperience" class="bg-red-500 mt-2 px-3 py-1 text-[12px] text-white ml-2">
                    Huỷ
                  </button>
                </div>
                
                <!-- Thông tin CV -->
                <div class="mt-3">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">- File CV không có thông tin liên hệ</label>
                        <input type="file" @change="onFileChange($event, 'cv_no_contact')" class="form-control-file" />
                        <a
                          v-if="fileCv?.[lang]?.cv_no_contact?.url"
                          :href="fileCv[lang].cv_no_contact.url"
                          target="_blank" class="font-medium inline-block mt-3 underline text-[13px]"
                        >
                          <svg width="18px" height="18px" class="inline-block mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Interface / Download"> <path id="Vector" d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                          {{ getFileName(fileCv[lang].cv_no_contact.url) }}
                        </a>
                        <div class="mt-3 text-[13px]" v-if="fileCv?.[lang]?.cv_no_contact?.file">
                          📎 File đã chọn: {{ fileCv[lang].cv_no_contact.file.name }}
                        </div>
                      </div>
                      <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">- File CV có thông tin liên hệ</label>
                        <input type="file" @change="onFileChange($event, 'cv_with_contact')" class="form-control-file" />
                        <a
                          v-if="fileCv?.[lang]?.cv_with_contact?.url"
                          :href="fileCv[lang].cv_with_contact.url"
                          target="_blank" class="font-medium inline-block mt-3 underline text-[13px]"
                        >
                          <svg width="18px" height="18px" class="inline-block mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Interface / Download"> <path id="Vector" d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                          {{ getFileName(fileCv[lang].cv_with_contact.url) }}
                        </a>
                        <div class="mt-3 text-[13px]" v-if="fileCv?.[lang]?.cv_with_contact?.file">
                          📎 File đã chọn: {{ fileCv[lang].cv_with_contact.file.name }}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div class="flex flex-col items-center">
                        <!-- Preview -->
                        <span class="block text-sm font-medium text-gray-700 mb-1">Ảnh thẻ</span>
                        <label for="avatar" class="cursor-pointer">
                          <img
                            :src="preview || defaultAvatar"
                            alt="Avatar"
                            class="h-[151px] object-cover border hover:opacity-80 transition"
                          />
                        </label>

                        <!-- Input file -->
                        <input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          @change="handleFileChange"
                          class="hidden"
                        />

                        <p v-if="avatar?.name" class="mt-2 text-sm text-gray-500">
                          {{ avatar.name }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p class="font-normal mt-3 text-[12px] text-red-600">* Dung lượng File CV không có thông tin liên hệ không quá 10MB</p>
                  <button @click.prevent="downloadCandidateCV(lang)" class="!w-auto btn-success flex items-center mt-3 px-2 py-1 rounded-[4px] text-[13px]">
                    <DownloadIcon class="block h-6 w-6 text-white mr-1" />
                    Xuất file
                  </button>
                </div>
             </div>
            <!-- Debug -->
            <!-- <pre>Họ và tên: {{ fullName }}</pre> -->
            <!-- <pre>Giới tính: {{ gender }}</pre> -->
            <!-- <pre>Điểm mạnh: {{ strength }}</pre> -->
            <!-- <pre>Nhóm ngành nghề: {{ industry }}</pre> -->
            <!-- <pre>Học vấn: {{ educationList }}</pre> -->
            <!-- <pre>Ngoại ngữ: {{ languageList }}</pre> -->
            <!-- <pre>Khu vực làm việc: {{ desiredLocation }}</pre> -->
            <!-- <pre>Chỗ ở hiện tại: {{ location }}</pre> -->
            <!-- <pre>Quá trình học tập: {{ timeEducation }}</pre> -->
            <!-- <pre>Kỹ năng: {{ skills }}</pre> -->
            <!-- <pre>Kinh nghiệm: {{ workExperience }}</pre> -->
            <!-- <pre>CV: {{ fileCv }}</pre> -->
          </div>
          <!-- Tabs hoặc lựa chọn ngôn ngữ -->
          <div>
          
          <div class="flex justify-end space-x-2">
            <button type="submit" class="btn btn-primary !w-auto" v-if="(!selectedCandidate) || selectedCandidate.permission_update == true">{{ selectedCandidate ? 'Cập nhật' : 'Thêm mới' }}</button>
          </div>
          </div>
        </form>

  </div>
</template>

<script setup>
import { PlusIcon, PencilAltIcon, XCircleIcon, EyeIcon, CloudDownloadIcon, DownloadIcon, AcademicCapIcon } from '@heroicons/vue/solid'
import { ref, onMounted, computed, reactive, watch, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash'
import { useRoute } from 'vue-router'
import { cloneDeep } from 'lodash'
import draggable from 'vuedraggable'
import Datepicker from 'vue3-datepicker'

import Swal from 'sweetalert2'
import Title from '../../components/Title.vue'
import Loading from '../../components/Loading.vue'
import { handleApiError } from '../../helpers/apiErrorHandler'
import { useToastr } from '../../plugins/toastr'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import BlotFormatter from 'quill-blot-formatter'
import VueMultiselect from 'vue-multiselect'
import axiosInstance from '../../axios'
import { can } from '../../helpers/permissions' // Import the can helper
import CandidateDetail from '../../components/candidate/CandidateDetail.vue'
const Languages = computed(() => store.getters['languages/languages'] || {})
//const lang = computed(() => store.getters['languages/languageCode'] || 'vi')
const userPermissions = computed(() => store.getters['auth/permissions'] || {})
const quill = ref(null)
const modules = { module: BlotFormatter }
const toolbar = [[{ header: [1, 2, 3, 4, 5, 6, false] }], [{ size: ['small', false, 'large', 'huge'] }], ['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'], [{ align: [] }], [{ list: 'ordered' }, { list: 'bullet' }], [{ color: [] }, { background: [] }], [{ font: [] }], ['link', 'image', 'video'], ['clean']]

const toastr = useToastr()
const route = useRoute()
const store = useStore()

const candidates = computed(() => store.getters['candidates/candidates'])
const pagination = computed(() => store.getters['candidates/pagination'])
const provinces = computed(() => store.getters['candidates/provinces'])
const allIndustries = computed(() => store.state.industries.industriesLang || {})
const allEducations = computed(() => store.state.candidates.educations || {})
const allLanguages = computed(() => store.state.candidates.languages || {})
const educations = ref([])
const educationList = ref([])
const languageList = ref({})
const languageOptions = ref([])
const lang = ref('vi')
const loading = ref(false)
const selectedCandidate = ref(null)

const preview = ref(null)
const defaultAvatar = ref('') // ảnh fallback
const avatar = ref({}) // ảnh fallback
const currentPhone = ref('')
const currentEmail = ref('')
const currentBirthday = ref('')
const currentLocation = ref(null)
const location = ref(null)
const currentIndustry = ref([])
const industry = ref([])
const industries = ref([])
const workExperience = ref({})
const skills = ref({})
const fileCv = ref({})
const currentGender = ref('')
const gender = ref({})
const currentEducation = ref({})
const currentDesiredLocation = ref([])
const desiredLocation = ref([])
const currentLanguage = ref({})
const currentStrength = ref('')
const strength = ref({})
const id = route.params.id
const timeEducation = ref({})
const currentFullName = ref('');
const fullName = ref({})
const cv_no_contact = ref({})
const cv_with_contact = ref({})
const currentTimeEducation = ref({
  time: '',
  school: '',
}) // Quá trình học tập
const currentSkills = ref({
  name: '',
  description: '',
}) // Các kỹ năng
const currentWorkExperience = ref({
  time: '',
  company: '',
  position: '',
  description: '',
}) // Kinh nghiệm làm việc
const selectedIndexWorkExperience = ref(null) // Giá trị bản ghỉ thứ {n} để cập nhật - Kinh nghiệm làm việc
const selectedIndexTimeEducation = ref(null) // Giá trị bản ghỉ thứ {n} để cập nhật - Quá trình học tập
const selectedIndexSkill = ref(null) // Giá trị bản ghỉ thứ {n} để cập nhật - Quá trình học tập


const onDesiredLocationChange = () => {
  desiredLocation.value = currentDesiredLocation.value ? currentDesiredLocation.value.map((loc) => loc.id) : []
}

const onCurrentLocationChange = () => {
  location.value = currentLocation.value?.id || 0
}

/* START: Theo dõi sự thay đổi của các trường */
watch(currentStrength, (val) => {
  strength.value[lang.value] = val
})

watch(currentLanguage, (val) => {
  languageList.value[lang.value] = val
})

watch(currentIndustry, (val) => {
  const selectedIds = val.map(i => i.id)
  // Duyệt qua tất cả ngôn ngữ và đồng bộ theo ID
  const synced = {}
  for (const locale in allIndustries.value) {
    const options = allIndustries.value[locale] || []
    synced[locale] = options.filter(opt => selectedIds.includes(opt.id))
  }
  industry.value = synced
})

watch(currentFullName, (newValue) => {
  fullName.value[lang.value] = newValue
})

watch(currentEducation, (newValue) => {
  educationList.value[lang.value] = newValue
})

watch(currentLanguage, (newValue) => {
  languageList.value[lang.value] = newValue
})

watch(currentGender, (newValue) => {
  gender.value[lang.value] = newValue
})
/* END: Theo dõi sự thay đổi của các trường */


/* START: Khi thay đổi ngôn ngữ tab */
watch(lang, (newLang) => {
  currentStrength.value = strength.value[newLang]
  currentFullName.value = fullName.value[newLang]
  currentGender.value = gender.value[newLang]

  industries.value = allIndustries.value[newLang]
  educations.value = allEducations.value[newLang]
  languageOptions.value = allLanguages.value[newLang]

  currentIndustry.value = industry.value[newLang]
  currentEducation.value = educationList.value[newLang]
  currentLanguage.value = languageList.value[newLang]
})
/* END: Khi thay đổi ngôn ngữ tab */

/* START: Ngày sinh */
const formatDate = (date) => {
  if (!date) return ''
      const d = new Date(date)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
}

const formattedBirthday = computed(() =>
  currentBirthday.value ? formatDate(currentBirthday.value) : ''
)
/* END: Ngày sinh */

/* Chỉnh sửa các bản ghi: Quá trình học tập */
const removeItemTimeEducation = (index) => {
  const skillList = timeEducation.value?.[lang.value];
  if (Array.isArray(skillList) && index >= 0 && index < skillList.length) {
    skillList.splice(index, 1);
  } else {
    console.warn('Danh sách kỹ năng không hợp lệ hoặc index vượt quá giới hạn');
  }
};

const editItemTimeEducation = (index) => { // Chỉnh sửa
  const list = timeEducation.value?.[lang.value];
  selectedIndexTimeEducation.value = index;
  if (Array.isArray(list) && list[index]) {
    currentTimeEducation.value = { ...list[index] };
  }
};

const existTimeEducation = () => {
  currentTimeEducation.value = {}; // Reset form
  selectedIndexTimeEducation.value = null // Reset lại chọn cập nhật kinh nghiệm làm việc
}

const updateTimeEducation = () => {
  const index = Number(selectedIndexTimeEducation.value)
  const langKey = lang.value

  // Đảm bảo mảng tồn tại trước
  if (!Array.isArray(timeEducation.value[langKey])) {
    timeEducation.value[langKey] = {}
  }

  const educations = timeEducation.value[langKey]

  if (educations[index]) {
    educations[index] = { ...currentTimeEducation.value } // clone object
    existTimeEducation()
  } else {
    console.warn(`Không thể cập nhật: index ${index} không hợp lệ`)
  }
}

const addItemTimeEducation = () => { // Thêm item quá trình học tập và mảng
  const langKey = lang.value;

  // Đảm bảo timeEducation là một object
  if (!timeEducation.value) {
    timeEducation.value = {};
  }

  // Đảm bảo mảng theo langKey tồn tại
  if (!Array.isArray(timeEducation.value[langKey])) {
    timeEducation.value[langKey] = [];
  }

  // Kiểm tra dữ liệu đầu vào
  if (currentTimeEducation.value.time && currentTimeEducation.value.school) {
    timeEducation.value[langKey].push({
      time: currentTimeEducation.value.time,
      school: currentTimeEducation.value.school
    });

    // Reset nếu muốn
    existTimeEducation()
  }
};
/* Chỉnh sửa các bản ghi: Quá trình học tập */

/* Chỉnh sửa các bản ghi: Kỹ năng */
const removeItemSkill = (index) => {
  const skillList = skills.value?.[lang.value];

  if (Array.isArray(skillList) && index >= 0 && index < skillList.length) {
    skillList.splice(index, 1);
  } else {
    console.warn('Danh sách kỹ năng không hợp lệ hoặc index vượt quá giới hạn');
  }
};

const editItemSkill = (index) => { // Chỉnh sửa
  const list = skills.value?.[lang.value];
  selectedIndexSkill.value = index;
  if (Array.isArray(list) && list[index]) {
    currentSkills.value = { ...list[index] };
  }
};

const existSkill = () => {
  currentSkills.value = {}; // Reset form
  selectedIndexSkill.value = null // Reset lại chọn cập nhật kinh nghiệm làm việc
}

const updateSkill = () => { // Cập nhật vào mạng Candidate
  const index = selectedIndexSkill.value;
  const skillsObj = skills.value?.[lang.value];

  if (Array.isArray(skillsObj) && index !== null && index !== '' && skillsObj[index]) {
    skillsObj[index] = { ...currentSkills.value }; // spread để tránh liên kết tham chiếu
    existSkill()
  } else {
    console.warn('Không thể cập nhật: dữ liệu hoặc index không hợp lệ');
  }
};

const addItemSkills = () => { // Thêm item kỹ năng vào mảng
  const langKey = lang.value;
  // Đảm bảo skills là một object
  if (!skills.value) {
    skills.value = {};
  }
  // Đảm bảo mảng theo langKey tồn tại
  if (!Array.isArray(skills.value[langKey])) {
    skills.value[langKey] = [];
  }
  // Kiểm tra dữ liệu đầu vào
  if (currentSkills.value.name && currentSkills.value.description) {
    skills.value[langKey].push({
      name: currentSkills.value.name,
      description: currentSkills.value.description
    });
    // Reset nếu muốn
    existSkill()
  }
};
/* Chỉnh sửa các bản ghi: Kỹ năng */

/* Chỉnh sửa các bản ghi: Kinh nghệm */
const removeItemExperience = (index) => {
  const skillList = workExperience.value?.[lang.value];

  if (Array.isArray(skillList) && index >= 0 && index < skillList.length) {
    skillList.splice(index, 1);
  } else {
    console.warn('Danh sách kỹ năng không hợp lệ hoặc index vượt quá giới hạn');
  }
};

const editItemExperience = (index) => { // Chỉnh sửa
  const list = workExperience.value?.[lang.value];
  selectedIndexWorkExperience.value = index;
  if (Array.isArray(list) && list[index]) {
    currentWorkExperience.value = { ...list[index] };
  }
};

const existWorkExperience = () => {
  currentWorkExperience.value = {description: ''}; // Reset form
  selectedIndexWorkExperience.value = null // Reset lại chọn cập nhật kinh nghiệm làm việc
}

const updateWorkExperience = () => { // Cập nhật vào mạng Candidate
  const index = selectedIndexWorkExperience.value;
  const experiences = workExperience.value?.[lang.value];

  if (Array.isArray(experiences) && index !== null && index !== '' && experiences[index]) {
    experiences[index] = { ...currentWorkExperience.value }; // spread để tránh liên kết tham chiếu
    existWorkExperience()
  } else {
    console.warn('Không thể cập nhật: dữ liệu hoặc index không hợp lệ');
  }
};

const addWorkExperience = () => { // Thêm item kinh nghệm làm việc và mảng
  const langKey = lang.value;
  // Đảm bảo timeEducation là một object
  if (!workExperience.value) {
    workExperience.value = {};
  }
  // Đảm bảo mảng theo langKey tồn tại
  if (!Array.isArray(workExperience.value[langKey])) {
    workExperience.value[langKey] = [];
  }
  // Kiểm tra dữ liệu đầu vào
  if (currentWorkExperience.value.time && currentWorkExperience.value.company) {
    workExperience.value[langKey].push({
      time: currentWorkExperience.value.time,
      company: currentWorkExperience.value.company,
      position: currentWorkExperience.value.position,
      description: currentWorkExperience.value.description
    });

    // Reset nếu muốn
    existWorkExperience()
  }
};
/* Chỉnh sửa các bản ghi: Kinh nghệm */

/* START: File CV */
const noContactFileName = computed(() => {
  const url = fileCv.value?.[lang]?.cv_no_contact?.url
  return url ? url.split('/').pop() : ''
})

const withContactFileName = computed(() => {
  const url = fileCv.value?.[lang]?.cv_with_contact?.url
  return url ? url.split('/').pop() : ''
})
// const onFileChange = (event, field) => {
//   const file = event.target.files[0]
//   if (!file) return
//   const langCode = lang.value
//   // Khởi tạo structure nếu chưa có
//   if (!fileCv.value) {
//     fileCv.value = {}
//   }
//   if (!fileCv.value[langCode]) {
//     fileCv.value[langCode] = {}
//   }
//   fileCv.value[langCode][field].file = file
//   event.target.value = ''
// }

const onFileChange = (event, field) => {
  const file = event.target.files[0]
  if (!file) return
  const langCode = lang.value
  // Khởi tạo fileCv nếu chưa có
  if (!fileCv.value) {
    fileCv.value = {}
  }
  // Khởi tạo cho ngôn ngữ nếu chưa có
  if (!fileCv.value[langCode]) {
    fileCv.value[langCode] = {}
  }
  // Khởi tạo cho loại CV nếu chưa có
  if (!fileCv.value[langCode][field]) {
    fileCv.value[langCode][field] = {
      url: null,
      file: {}
    }
  }
  // Gán file
  fileCv.value[langCode][field].file = file
  // Reset input
  event.target.value = ''
}

// Ảnh avatar
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    avatar.value = file // gán trực tiếp vào form
    preview.value = URL.createObjectURL(file)
  }
}

const getFileName = (url) => {
  try {
    return decodeURIComponent(url.split('/').pop())
  } catch {
    return url
  }
}
/* END: File CV */


// Kiểm tra nếu Lang và id tồn tại hoặc thay đổi thì reload lại các giá trị
const parseFromApi = (str) => { // Format date
  if (!str) return null
  const [y, m, d] = str.split('-')
  return new Date(y, m - 1, d)
}

const fetchShowJob = async () => {
  if (!route.params.id) return // Không gọi nếu không có id
  loading.value = true
  try {
    const data = await store.dispatch('candidates/fetchShowCandidate', route.params.id)
    if (!data || !data.candidate) {
      throw new Error('Dữ liệu trả về không hợp lệ')
    }

    if (id && allIndustries.value && allIndustries.value[lang.value]) { // Nhóm ngành nghề theo Lang
      industries.value = allIndustries.value[lang.value]
    }
    if (id && allEducations.value && allEducations.value[lang.value]) { // Học vấn theo Lang
      educations.value = allEducations.value[lang.value]
    }
    if (id && allLanguages.value && allLanguages.value[lang.value]) { // Ngoại ngữ theo lang
      languageOptions.value = allLanguages.value[lang.value]
    }

    // Cập nhật khi có dữ liệu
    const candidate = data.candidate
    const clone = cloneDeep(candidate)
    selectedCandidate.value = clone

    currentFullName.value = clone?.full_name[lang.value] || ''
    fullName.value = clone?.full_name || {}
    currentGender.value = clone?.gender[lang.value] || ''
    gender.value = clone?.gender || {}
    currentPhone.value = clone?.phone || ''
    currentEmail.value = clone?.email || ''
    currentEducation.value = clone?.education[lang.value] || {}
    educationList.value = clone?.education || ''
    //currentLocation.value = clone?.current_location || ''
    currentLocation.value = provinces.value.find(
        p => p.id === clone?.current_location
    ) || null
    location.value = clone?.current_location || ''
    
    currentIndustry.value = clone?.industry_id?.[lang.value] || []
    industry.value = clone?.industry_id || []
    currentLanguage.value = clone?.language?.[lang.value] || []
    languageList.value = clone?.language || []

    // Ngày sinh
    currentBirthday.value = parseFromApi(clone?.birthday)
    formattedBirthday.value = clone?.birthday

    // Khu vực mong muốn làm việc
    const desiredLocationIds = clone?.desired_locations?.map(loc => loc.location_id) || []
    currentDesiredLocation.value = provinces.value.filter(p => desiredLocationIds.includes(p.id)) || []
    desiredLocation.value = provinces.value.filter(p => desiredLocationIds.includes(p.id)) || []

    timeEducation.value = clone?.time_education || {}
    skills.value = clone?.skills || {}
    strength.value = clone?.strength || {}
    currentStrength.value = clone?.strength?.[lang.value] || ''
    workExperience.value = clone?.work_experience || {}

    fileCv.value = clone?.file_cv || {}
    defaultAvatar.value = clone?.avatar_url || ''

    const currentLangCV = fileCv.value[lang.value] || {}
    cv_no_contact.value = currentLangCV.cv_no_contact || null // dùng để hiển thị tên
    cv_with_contact.value = currentLangCV.cv_with_contact || null
    
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu ứng viên:', error)
    toastr.error('Không thể tải dữ liệu công việc')
  } finally {
    loading.value = false
  }
}

// watchEffect(() => {

//   if (!id) return
  
//   if (id && allIndustries.value && allIndustries.value[lang.value]) { // Nhóm ngành nghề theo Lang
//     industries.value = allIndustries.value[lang.value]
//     }
//     if (id && allEducations.value && allEducations.value[lang.value]) { // Học vấn theo Lang
//         educations.value = allEducations.value[lang.value]
//     }
//     if (id && allLanguages.value && allLanguages.value[lang.value]) { // Ngoại ngữ theo lang
//         languageOptions.value = allLanguages.value[lang.value]
//     }

//     // Cập nhật khi có dữ liệu
//     const candidate = candidates.value.find((item) => item.id == id)
//     const clone = cloneDeep(candidate)
//     selectedCandidate.value = clone

//     currentFullName.value = clone?.full_name[lang.value] || ''
//     fullName.value = clone?.full_name || {}
//     currentGender.value = clone?.gender[lang.value] || ''
//     gender.value = clone?.gender || {}
//     currentPhone.value = clone?.phone || ''
//     currentEmail.value = clone?.email || ''
//     currentEducation.value = clone?.education[lang.value] || {}
//     educationList.value = clone?.education || ''
//     //currentLocation.value = clone?.current_location || ''
//     currentLocation.value = provinces.value.find(
//         p => p.id === clone?.current_location
//     ) || null
//     location.value = clone?.current_location || ''
//     currentIndustry.value = clone?.industry_id?.[lang.value] || []
//     industry.value = clone?.industry_id || []
//     currentLanguage.value = clone?.language?.[lang.value] || []
//     languageList.value = clone?.language || []

//     // Ngày sinh
//     currentBirthday.value = parseFromApi(clone?.birthday)
//     formattedBirthday.value = clone?.birthday

//     // Khu vực mong muốn làm việc
//     const desiredLocationIds = clone?.desired_locations?.map(loc => loc.location_id) || []
//     currentDesiredLocation.value = provinces.value.filter(p => desiredLocationIds.includes(p.id)) || []
//     desiredLocation.value = provinces.value.filter(p => desiredLocationIds.includes(p.id)) || []

//     timeEducation.value = clone?.time_education || {}
//     skills.value = clone?.skills || {}
//     strength.value = clone?.strength || {}
//     currentStrength.value = clone?.strength?.[lang.value] || ''
//     workExperience.value = clone?.work_experience || {}

//     fileCv.value = clone?.file_cv || {}
// })


/* Submit Form */
const handleSubmit = async () => {
  loading.value = true
  try {
    const action = selectedCandidate.value ? 'candidates/updateCandidate' : 'candidates/addCandidate'
    //const industryIds = candidateForm.value.industry_id.map(item => item.id) || [];
    const formData = new FormData()
    formData.append('id', id || 0)
    formData.append('phone', currentPhone.value || '');
    formData.append('birthday', formattedBirthday.value || '');
    formData.append('email', currentEmail.value || '');
    // formData.append('language_other', language_other.value || '');
    formData.append('current_location', location.value || 0);
    formData.append('desired_location', JSON.stringify(desiredLocation.value));

    // Dạng object cần stringify lại
    formData.append('full_name', JSON.stringify(fullName.value));
    formData.append('industry_id', JSON.stringify(industry.value));
    formData.append('education', JSON.stringify(educationList.value));
    formData.append('language', JSON.stringify(languageList.value));
    //formData.append('experience_summary', JSON.stringify(candidateForm.value.experience_summary));
    formData.append('currentStrength', JSON.stringify(strength.value));
    formData.append('time_education', JSON.stringify(timeEducation.value));
    formData.append('skills', JSON.stringify(skills.value));
    formData.append('work_experience', JSON.stringify(workExperience.value));
    formData.append('gender', JSON.stringify(gender.value));


    // Thêm file cv
    Languages.value.forEach(lang => {
      const langCv = fileCv.value?.[lang.code]
      if (!langCv) return
      const noContact = langCv.cv_no_contact?.file
      const withContact = langCv.cv_with_contact?.file
      if (noContact instanceof File) {
        formData.append(`file_cv[${lang.code}][cv_no_contact]`, noContact)
      }
      if (withContact instanceof File) {
        formData.append(`file_cv[${lang.code}][cv_with_contact]`, withContact)
      }
    })

    if( avatar.value && avatar.value instanceof File ){
      formData.append('avatar', avatar.value)
    }

    const data = await store.dispatch(action, formData)
    toastr.success(`${data.message}`)
  } catch (error) {
    console.log(error)
    handleApiError(error)
  } finally {
    loading.value = false
  }
}
/* Submit Form */

/* Xuất file cv word */
const downloadCandidateCV = (lang = 'vi') => {
  store.dispatch('candidates/downloadCV', { lang, id })
}
/* Xuất file cv word */


/*==================================================*/
/*==================================================*/
/*==================================================*/

/* START: Check thông tin tồn tại */
const validationErrors = reactive({
  phoneExists: false,
  emailExists: false,
})

const validationMessageErrors = reactive({
  phoneExists: '',
  emailExists: '',
})

const checkExists = async () => {
  const candidate_id = id?? 0;
  if (!currentPhone && !currentEmail) return // Không cần gọi nếu rỗng
  try {
    const res = await axiosInstance.get('candidates/check-exists', {
      params: { phone, email, id }
    })
    validationErrors.emailExists = res.data.email.status
    validationErrors.phoneExists = res.data.phone.status

    validationMessageErrors.phoneExists = res.data.phone.message
    validationMessageErrors.emailExists = res.data.email.message
  } catch (error) {
    console.error('Lỗi khi kiểm tra tồn tại:', error)
  }
}
/* END: Check thông tin tồn tại */

onMounted(async () => {
  await Promise.all([
    store.dispatch('candidates/fetchProvinces'), 
    store.dispatch('candidates/fetchConfigCandidate'), 
    store.dispatch('industries/fetchIndustryListsLang'),
    store.dispatch('candidates/fetchCandidates'),
    store.dispatch('candidates/fetchConfigCandidate'),
    fetchShowJob(),
  ])

  if (!route.params.id) {
    // Gán dữ liệu mặc định
    industries.value = allIndustries.value['vi'] || []
    educations.value = allEducations.value['vi'] || []
    languageOptions.value = allLanguages.value['vi'] || []

    // Gán rỗng cho form
    fullName.value = {}
    gender.value = {}
    educationList.value = {}
    industry.value = {}
    languageList.value = {}
    strength.value = {}

    currentFullName.value = ''
    currentGender.value = ''
    currentEducation.value = {}
    currentIndustry.value = []
    currentLanguage.value = []
    currentStrength.value = ''
  }
})
</script>
