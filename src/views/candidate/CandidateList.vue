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
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">{{ route.meta.title }}</span>
          </div>
        </li>
      </ol>
    </nav>
    <Loading :loading="loading" />
    <div class="flex items-center justify-between">
      <Title :title="route.meta.title" />
      <a href="" v-if="can(userPermissions, 'candidates', 'create')" class="btn btn-success !w-auto flex items-center" @click.prevent="showModal">
        <PlusIcon class="block h-6 w-6 text-white" aria-hidden="true" />
        Thêm mới
      </a>
    </div>
    <div class="grid md:grid-cols-12 space-x-1">
      <div class="md:col-span-3">
        <VueMultiselect v-if="users && users.length > 0" class="flex-1" v-model="selectedUserFilter" :options="users" :taggable="true" label="name" :searchable="true" track-by="id" @select="onUserChangeFilter" placeholder="Người tạo">
          <template v-if="selectedUserFilter && selectedUserFilter.id !== 0" #caret>
            <button @click.stop="clearSelectedUserFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
              ✕
            </button>
          </template>
        </VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedIndustryFilter" :multiple="true" :options="industries" :taggable="true" label="title" :searchable="true" track-by="id" placeholder="Ngành nghề"></VueMultiselect>
      </div>
      <div class="md:col-span-2">
        <VueMultiselect class="flex-1" v-model="selectedLanguageFilter" :options="languages" :taggable="true" label="name" :searchable="true" track-by="id" @select="onLanguageChangeFilter" placeholder="Ngoại ngữ">
          <template v-if="selectedLanguageFilter && selectedLanguageFilter.id !== 0" #caret>
            <button @click.stop="clearSelectedLanguageFilter" class="absolute multiselect__clear top-1/2 translate-y-[-50%] z-10 right-[10px] text-[11px]">
              ✕
            </button>
          </template>
        </VueMultiselect>
      </div>
      <div class="md:col-span-3">
        <VueMultiselect class="flex-1" v-model="selectedDesiredLocationsFilter" :options="provinces" :taggable="true" label="name" :searchable="true" track-by="id" multiple @select="onDesiredLocationsChangeFilter" @remove="onDesiredLocationsChangeFilter" placeholder="Khu vực mong muốn"></VueMultiselect>
      </div>
      <div class="col-span-2">
        <input type="text" class="form-control flex-1" placeholder="Nhập từ khóa tìm kiếm" v-model="formFilter.keyword" />
      </div>
    </div>
    <div>
      <table class="table-order text-sm w-full text-left rtl:text-right">
        <thead class="text-white bg-primary dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th>STT</th>
            <th>Code</th>
            <th>Thông tin</th>
            <th>Ngành nghề</th>
            <th>Ngày hết hạn</th>
            <th>Ngày tạo</th>
            <th>Người tạo</th>
            <th class="text-right" v-if="can(userPermissions, 'candidates', 'edit') || can(userPermissions, 'candidates', 'destroy')">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(candidate, key) in candidates" :key="candidate.id" class="border-b hover:bg-gray-100">
            <td>{{ key + 1 }}</td>
            <td class="font-bold text-blue-600">{{ candidate.code }}</td>
            <td class="">
              <span class="font-bold">{{ candidate.full_name.vi }}</span>
              <br />
              {{ candidate.email }}
              <br />
              {{ candidate.phone }}
            </td>
            <td>
              <!-- {{ candidate.industry_id.vi?.map(item => item.title).join(', ') }} -->
              <div class="flex flex-wrap gap-1" v-html="renderIndustries(candidate.industry_id.vi)"></div>
            </td>
            <td>{{ candidate.expiry_date }}</td>
            <td>{{ candidate.created_at }}</td>
            <td>{{ candidate.createBy }}</td>
            <td v-if="can(userPermissions, 'candidates', 'edit') || can(userPermissions, 'candidates', 'destroy')">
              <div class="whitespace-nowrap flex flex-col space-y-1">
                <div class="flex items-center space-x-1 justify-end">
                  <button @click.prevent="downloadCandidateCV()" class="btn btn-success !w-auto flex items-center">
                    <DownloadIcon class="block h-6 w-6 text-white mr-1" />
                    Xuất file
                  </button>
                  <button @click="openAssignJobPopup(candidate.id)" class="btn btn-success !w-auto flex items-center">
                    <PlusIcon class="block h-6 w-6 text-white mr-1" />
                    Gán Job
                  </button>
                  <button @click="showCandidate(candidate.id)" class="btn btn-warning !w-auto flex items-center">
                    <EyeIcon class="block h-6 w-6 text-white mr-1" />
                    Xem
                  </button>
                </div>
                <div class="flex items-center space-x-1 justify-end">
                  <button @click="openToggleAssignUserPopup(candidate.id)" class="btn bg-black !w-auto flex items-center" v-if="can(userPermissions, 'candidates', 'administrator')">
                    <PlusIcon class="block h-6 w-6 text-white mr-1" />
                    <span class="text-white">Gán nhân viên</span>
                  </button>
                  <button @click="editCandidate(candidate)" class="btn btn-primary !w-auto flex items-center" v-if="can(userPermissions, 'candidates', 'edit')">
                    <PencilAltIcon class="block h-6 w-6 text-white mr-1" />
                    Sửa
                  </button>
                  <button @click="deleteCandidate(candidate.id)" class="btn btn-danger !w-auto flex items-center" v-if="can(userPermissions, 'candidates', 'destroy')">
                    <XCircleIcon class="block h-6 w-6 text-white mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex justify-between items-center mt-4">
      <span class="text-sm text-gray-700">Trang {{ pagination.current_page }} của {{ pagination.last_page }} (Tổng: {{ pagination.total }} mục)</span>
      <div class="flex space-x-2" v-if="pagination.last_page > 1">
        <button @click.prevent="goToPage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Trước</button>
        <button v-for="page in getPageNumbers" :key="page" @click="goToPage(page)" :class="['btn px-3 py-1 rounded', page === currentPage ? 'bg-primary !text-white !border-primary' : 'bg-gray-300 text-black', page === '...' ? 'cursor-default bg-gray-200 text-gray-500' : '']" :disabled="page === '...'">
          {{ page }}
        </button>
        <button @click.prevent="goToPage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="btn bg-gray-300 text-white px-3 py-1 rounded disabled:opacity-50">Sau</button>
      </div>
    </div>
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-semibold mb-4">{{ selectedCandidate ? 'Cập nhật ứng viên' : 'Thêm mới ứng viên' }}</h2>
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
                    <input v-model="candidateForm.phone" type="text" @keydown.enter.prevent class="form-control" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Email
                      <span class="text-red-600">*</span>
                      <span v-if="validationErrors.emailExists" class="text-red-600 text-[12px] ml-1">{{ validationMessageErrors.emailExists }}</span>
                    </label>
                    <input v-model="candidateForm.email" type="email" @keydown.enter.prevent class="form-control" />
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
                    <VueMultiselect v-model="currentLanguage" :options="languages" :taggable="true" label="name" :searchable="true" track-by="id" placeholder="Chọn ngoại ngữ"></VueMultiselect>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Chỗ ở hiện tại
                      <span class="text-red-600">*</span>
                    </label>
                    <VueMultiselect v-model="selectedCurrentLocation" :options="provinces" :taggable="true" label="name" :searchable="true" track-by="id" @select="onCurrentLocationChange" placeholder="Chọn chỗ ở hiện tại"></VueMultiselect>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Khu vực mong muốn làm việc
                      <span class="text-red-600">*</span>
                    </label>
                    <VueMultiselect v-model="selectedDesiredLocation" :options="provinces" :taggable="true" label="name" :searchable="true" track-by="id" @select="onDesiredLocationChange" multiple placeholder="Chọn"></VueMultiselect>
                  </div>
                </div>
                <!-- Quá trình học tập -->
                <div class=" mt-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                      Quá trình học tập
                  </label>
                  <div
                    v-if="candidateForm.timeEducation && candidateForm.timeEducation[lang] && candidateForm.timeEducation[lang].length"
                    class="mb-3"
                  >
                    <div class="bg-gray-100 p-4 rounded-[4px]">
                      <ul role="list" class="my-2">
                        <draggable
                          v-model="candidateForm.timeEducation[lang]"
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
                      <input type="text" v-model="selectedTimeEducation.time" class="form-control" placeholder="Thời gian *">
                    </div>
                    <div class="col-span-8">
                      <textarea type="text" v-model="selectedTimeEducation.school" class="form-control" placeholder="Mô tả *"></textarea>
                    </div>
                  </div>
                  
                  <button v-if="selectedIndexTimeEducation == null" @click.prevent="addItemTimeEducation" :disabled="!selectedTimeEducation.time || !selectedTimeEducation.school" class="disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 mt-2 px-3 py-1 text-[12px] text-white">Thêm quá trình +</button>
                  
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
                    v-if="candidateForm.skills && candidateForm.skills[lang] && candidateForm.skills[lang].length"
                    class="mb-3"
                  >
                    <div class="">
                      <div class="">
                        <div class="max-w-none mx-auto">
                          <div class="bg-white overflow-hidden sm:rounded-lg sm:shadow">
                            
                            <ul class="opacity-100">
                              <draggable
                                v-model="candidateForm.skills[lang]"
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
                      <input type="text" v-model="selectedSkills.name" class="form-control" placeholder="Tên kỹ năng">
                    </div>
                    <div class="col-span-8">
                      <textarea type="text" v-model="selectedSkills.description" class="form-control" placeholder="Mô tả"></textarea>
                    </div>
                  </div>
                  
                  <button v-if="selectedIndexSkill == null" @click.prevent="addItemSkills" :disabled="!selectedSkills.name || !selectedSkills.description" class="disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 mt-2 px-3 py-1 text-[12px] text-white">Thêm kỹ năng +</button>
                  
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
                  <div class="dark:bg-gray-800 w-full" v-if="candidateForm.work_experience && candidateForm.work_experience[lang] && candidateForm.work_experience[lang].length">
                    <div class="flex flex-col justify-center mt-3 mb-3">
                      <div class="gap-4 grid grid-cols-1">
                        <draggable
                          v-model="candidateForm.work_experience[lang]"
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
                      <input type="text" v-model="selectedWorkExperience.time" class="form-control" placeholder="Thời gian *">
                    </div>
                    <div class="col-span-4">
                      <input type="text" v-model="selectedWorkExperience.company" class="form-control" placeholder="Công ty *">
                    </div>
                    <div class="col-span-4">
                      <input type="text" v-model="selectedWorkExperience.position" class="form-control" placeholder="Vị trí *">
                    </div>
                  </div>
                  <div class="mt-3">
                    <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="selectedWorkExperience.description" contentType="html" :key="lang" />
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

                <!-- Kinh nghiệm -->
                <div class="mt-3 hidden">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tóm tắt kinh nghiệm và nhận xét</label>
                  <quill-editor ref="quill" :modules="modules" :toolbar="toolbar" v-model:content="currentExperienceSummary" contentType="html" :key="lang" />
                </div>
                <!-- Thông tin CV -->
                <div class="mt-3">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">- File CV không có thông tin liên hệ</label>
                        <input type="file" @change="onFileChange($event, 'cv_no_contact')" class="form-control-file" />
                        <a
                          v-if="candidateForm.file_cv?.[lang]?.cv_no_contact?.url"
                          :href="candidateForm.file_cv[lang].cv_no_contact.url"
                          target="_blank" class="font-medium inline-block mt-3 underline text-[13px]"
                        >
                          <svg width="18px" height="18px" class="inline-block mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Interface / Download"> <path id="Vector" d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                          {{ getFileName(candidateForm.file_cv[lang].cv_no_contact.url) }}
                        </a>
                        <div class="mt-3 text-[13px]" v-if="candidateForm.file_cv?.[lang]?.cv_no_contact?.file">
                          📎 File đã chọn: {{ candidateForm.file_cv[lang].cv_no_contact.file.name }}
                        </div>
                      </div>
                      <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">- File CV có thông tin liên hệ</label>
                        <input type="file" @change="onFileChange($event, 'cv_with_contact')" class="form-control-file" />
                        <a
                          v-if="candidateForm.file_cv?.[lang]?.cv_with_contact?.url"
                          :href="candidateForm.file_cv[lang].cv_with_contact.url"
                          target="_blank" class="font-medium inline-block mt-3 underline text-[13px]"
                        >
                          <svg width="18px" height="18px" class="inline-block mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Interface / Download"> <path id="Vector" d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
                          {{ getFileName(candidateForm.file_cv[lang].cv_with_contact.url) }}
                        </a>
                        <div class="mt-3 text-[13px]" v-if="candidateForm.file_cv?.[lang]?.cv_with_contact?.file">
                          📎 File đã chọn: {{ candidateForm.file_cv[lang].cv_with_contact.file.name }}
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

                        <p v-if="candidateForm.avatar?.name" class="mt-2 text-sm text-gray-500">
                          {{ candidateForm.avatar.name }}
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
            <pre>{{ candidateForm }}</pre>
          </div>
          <!-- Tabs hoặc lựa chọn ngôn ngữ -->
          <div>
          
          <div class="flex justify-end space-x-2">
            <button @click="closeModal" class="btn btn-danger !w-auto">Hủy</button>
            <button type="submit" class="btn btn-primary !w-auto" v-if="(!selectedCandidate) || selectedCandidate.permission_update == true">{{ selectedCandidate ? 'Cập nhật' : 'Thêm mới' }}</button>
          </div>
          </div>
        </form>
      </div>
    </div>
    <CandidateDetail :candidateId="selectedCandidateId" :isVisible="isShowCandidate" @close="closeCandidateDetail" />
    <!-- Popup gán job -->
    <div v-if="showAssignJobPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative">
        <h3 class="text-lg font-semibold mb-4">Gán Job cho {{ selectedCandidateFullName }}</h3>
        <Loading :loading="loadingAssignJob" />
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chọn Job</label>
            <VueMultiselect v-model="selectedJob" :options="jobs" :taggable="true" label="job_title" track-by="id" placeholder="Nhập từ khóa để tìm kiếm Job" :searchable="true" :loading="loadingJobs" @search-change="debouncedSearchJobs" @select="onJobChange"></VueMultiselect>
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="closeAssignJobPopup" class="btn btn-danger !w-auto">Hủy</button>
            <button @click="assignJob" class="btn btn-primary !w-auto" :disabled="!selectedJob">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
    <!-- END -->

    <!-- Popup gán nhân viên -->
    <div v-if="toggleAssignUserPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] !my-0">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative">
        <h3 class="text-lg font-semibold mb-4">Gán nhân viên cho ứng viên: {{ selectedCandidateFullName }}</h3>
        <Loading :loading="loadingAssignJob" />
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Chọn nhân viên</label>
            <VueMultiselect
              v-model="selectedUsersAssign"
              :options="usersAssign"
              :taggable="true"
              :multiple="true"
              @search-change="handleSearchUser"
              label="name"     
              track-by="id"
              placeholder="Nhập từ khóa để tìm kiếm Nhân viên"
              :searchable="true"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="closeToggleAssignUserPopup" class="btn btn-danger !w-auto">Hủy</button>
            <button @click="handleAssignUsers" class="btn btn-primary !w-auto" :disabled="!selectedUsersAssign">Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
    <!-- END -->
  </div>
</template>

<script setup>
import { PlusIcon, PencilAltIcon, XCircleIcon, EyeIcon, CloudDownloadIcon, DownloadIcon, AcademicCapIcon } from '@heroicons/vue/solid'
import { ref, onMounted, computed, reactive, watch } from 'vue'
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
const defaultLanguages = computed(() => store.getters['languages/languageCode'] || 'vi')
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
const allEducations = computed(() => store.state.candidates.educations || {})
const allLanguages = computed(() => store.state.candidates.languages || {})
const educations = ref([])
const languages = ref([])

const allIndustries = computed(() => store.state.industries.industriesLang || {})

const industries = ref([])
const users = ref([])
const currentPage = ref(1)
const selectedCandidate = ref(null)
const isModalOpen = ref(false)
const isShowCandidate = ref(false)
const selectedCandidateId = ref(null)
const loading = ref(false)
const selectedIndustryFilter = ref([])
const selectedUserFilter = ref(null)
const selectedLanguageFilter = ref(null) // Thêm bộ lọc ngoại ngữ
const selectedDesiredLocationsFilter = ref([]) // Thêm bộ lọc khu vực mong muốn
const selectedIndustryId = ref([])
const selectedTimeEducation = ref({
  time: '',
  school: '',
}) // Quá trình học tập
const selectedSkills = ref({
  name: '',
  description: '',
}) // Các kỹ năng
const selectedWorkExperience = ref({
  time: '',
  company: '',
  position: '',
  description: '',
}) // Kinh nghiệm làm việc
const selectedIndexWorkExperience = ref(null) // Giá trị bản ghỉ thứ {n} để cập nhật - Kinh nghiệm làm việc
const selectedIndexTimeEducation = ref(null) // Giá trị bản ghỉ thứ {n} để cập nhật - Quá trình học tập
const selectedIndexSkill = ref(null) // Giá trị bản ghỉ thứ {n} để cập nhật - Quá trình học tập

const selectedEducation = ref(null)
const selectedLanguage = ref(null)
const selectedCurrentLocation = ref(null)
const selectedDesiredLocation = ref(null)
const showAssignJobPopup = ref(false) // Trạng thái hiển thị popup
const toggleAssignUserPopup = ref(false) // Popup gán nhân viên
const selectedJob = ref(null) // Job được chọn để gán
const jobs = ref([]) // Danh sách jobs
const selectedCandidateFullName = ref('') // Tên ứng viên được chọn
const loadingAssignJob = ref(false) // Trạng thái loading khi gán job
const loadingJobs = ref(false) // Trạng thái loading khi tìm kiếm jobs
const preview = ref(null)
const defaultAvatar = ref('') // ảnh fallback
const currentBirthday = ref('') // Ngày sinh
const candidateForm = ref({
  full_name: {},
  phone: '',
  email: '',
  gender: {},
  birthday: '',
  avatar: {},
  industry_id: [],
  education: {},
  language: {},
  language_other: '',
  current_location: 0,
  desired_location: [],
  experience_summary: {},
  currentStrength: {},
  timeEducation: {},
  skills: {},
  work_experience: {},
  file_cv: {},
  cv_no_contact: null,
  cv_with_contact: null,
})
const selectedUsersAssign =  ref([]) // Job được chọn để gán
const usersAssign = ref([])

const noContactFileName = computed(() => {
  const url = candidateForm.value.file_cv?.[lang]?.cv_no_contact?.url
  return url ? url.split('/').pop() : ''
})

const withContactFileName = computed(() => {
  const url = candidateForm.value.file_cv?.[lang]?.cv_with_contact?.url
  return url ? url.split('/').pop() : ''
})

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

// Hiển thị danh sách ngành nghề
const renderIndustries = (list) => {
  return list?.map(item => `<p class="p-1 rounded-sm btn-success text-xs">${item.title}</p>`).join('') || ''
}

/* Chỉnh sửa các bản ghi: Kinh nghệm */
const removeItemExperience = (index) => {
  const skillList = candidateForm.value.work_experience?.[lang.value];

  if (Array.isArray(skillList) && index >= 0 && index < skillList.length) {
    skillList.splice(index, 1);
  } else {
    console.warn('Danh sách kỹ năng không hợp lệ hoặc index vượt quá giới hạn');
  }
};

const editItemExperience = (index) => { // Chỉnh sửa
  const list = candidateForm.value.work_experience?.[lang.value];
  selectedIndexWorkExperience.value = index;
  if (Array.isArray(list) && list[index]) {
    selectedWorkExperience.value = { ...list[index] };
  }
};

// Xử lý upload file
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    candidateForm.value.avatar = file // gán trực tiếp vào form
    preview.value = URL.createObjectURL(file)
  }
}

const updateWorkExperience = () => { // Cập nhật vào mạng Candidate
  const index = selectedIndexWorkExperience.value;
  const experiences = candidateForm.value.work_experience?.[lang.value];

  if (Array.isArray(experiences) && index !== null && index !== '' && experiences[index]) {
    experiences[index] = { ...selectedWorkExperience.value }; // spread để tránh liên kết tham chiếu
    selectedIndexWorkExperience.value = null;
    selectedWorkExperience.value = {description: ''}; // Reset form
  } else {
    console.warn('Không thể cập nhật: dữ liệu hoặc index không hợp lệ');
  }
};

const existWorkExperience = () => {
  selectedWorkExperience.value = {description: ''}; // Reset form
  selectedIndexWorkExperience.value = null // Reset lại chọn cập nhật kinh nghiệm làm việc
}
/* Chỉnh sửa các bản ghi: Kinh nghệm */

/* Chỉnh sửa các bản ghi: Quá trình học tập */
const removeItemTimeEducation = (index) => {
  const skillList = candidateForm.value.timeEducation?.[lang.value];

  if (Array.isArray(skillList) && index >= 0 && index < skillList.length) {
    skillList.splice(index, 1);
  } else {
    console.warn('Danh sách kỹ năng không hợp lệ hoặc index vượt quá giới hạn');
  }
};

const editItemTimeEducation = (index) => { // Chỉnh sửa
  const list = candidateForm.value.timeEducation?.[lang.value];
  selectedIndexTimeEducation.value = index;
  if (Array.isArray(list) && list[index]) {
    selectedTimeEducation.value = { ...list[index] };
  }
};

const updateTimeEducation = () => { // Cập nhật vào mạng Candidate
  const index = selectedIndexTimeEducation.value;
  const educations = candidateForm.value.timeEducation?.[lang.value];

  if (Array.isArray(educations) && index !== null && index !== '' && educations[index]) {
    educations[index] = { ...selectedTimeEducation.value }; // spread để tránh liên kết tham chiếu
    selectedIndexTimeEducation.value = null;
    selectedTimeEducation.value = {};
  } else {
    console.warn('Không thể cập nhật: dữ liệu hoặc index không hợp lệ');
  }
};

const existTimeEducation = () => {
  selectedTimeEducation.value = {}; // Reset form
  selectedIndexTimeEducation.value = null // Reset lại chọn cập nhật kinh nghiệm làm việc
}
/* Chỉnh sửa các bản ghi: Kinh nghệm */

/* Chỉnh sửa các bản ghi: Kỹ năng */
const removeItemSkill = (index) => {
  const skillList = candidateForm.value.skills?.[lang.value];

  if (Array.isArray(skillList) && index >= 0 && index < skillList.length) {
    skillList.splice(index, 1);
  } else {
    console.warn('Danh sách kỹ năng không hợp lệ hoặc index vượt quá giới hạn');
  }
};

const editItemSkill = (index) => { // Chỉnh sửa
  const list = candidateForm.value.skills?.[lang.value];
  selectedIndexSkill.value = index;
  if (Array.isArray(list) && list[index]) {
    selectedSkills.value = { ...list[index] };
  }
};

const updateSkill = () => { // Cập nhật vào mạng Candidate
  const index = selectedIndexSkill.value;
  const skills = candidateForm.value.skills?.[lang.value];

  if (Array.isArray(skills) && index !== null && index !== '' && skills[index]) {
    skills[index] = { ...selectedSkills.value }; // spread để tránh liên kết tham chiếu
    selectedIndexSkill.value = null;
    selectedSkills.value = {};
  } else {
    console.warn('Không thể cập nhật: dữ liệu hoặc index không hợp lệ');
  }
};

const existSkill = () => {
  selectedSkills.value = {}; // Reset form
  selectedIndexSkill.value = null // Reset lại chọn cập nhật kinh nghiệm làm việc
}
/* Chỉnh sửa các bản ghi: Kinh nghệm */



/* Xuất file cv word */
const downloadCandidateCV = (lang = 'vi') => {
  const id = candidateForm.value.id
  store.dispatch('candidates/downloadCV', { lang, id })
}
/* Xuất file cv word */

/* START: Thêm ngôn ngữ */ 
const lang = ref('vi') // Đặt mặc định Ngôn Ngữ

watch(lang, (newLang) => {
  industries.value = allIndustries.value[newLang]
  educations.value = allEducations.value[newLang]
  languages.value = allLanguages.value[newLang]

   // ✅ Load lại đường dẫn file đã có nếu tồn tại
  const fileData = candidateForm.value.file_cv?.[newLang] || {}
  candidateForm.value.cv_no_contact = fileData.cv_no_contact || null
  candidateForm.value.cv_with_contact = fileData.cv_with_contact || null
})

// Computed dùng v-model để nhập các trường được gán theo ngôn ngữ
const currentFullName = computed({ // Họ tên
  get() {
    return candidateForm.value.full_name[lang.value] || ''
  },
  set(val) {
    candidateForm.value.full_name[lang.value] = val
  }
})

const currentGender = computed({ // Họ tên
  get() {
    return candidateForm.value.gender[lang.value] || ''
  },
  set(val) {
    candidateForm.value.gender[lang.value] = val
  }
})

const addItemTimeEducation = () => { // Thêm item quá trình học tập và mảng
  const langKey = lang.value;

  // Đảm bảo timeEducation là một object
  if (!candidateForm.value.timeEducation) {
    candidateForm.value.timeEducation = {};
  }

  // Đảm bảo mảng theo langKey tồn tại
  if (!Array.isArray(candidateForm.value.timeEducation[langKey])) {
    candidateForm.value.timeEducation[langKey] = [];
  }

  // Kiểm tra dữ liệu đầu vào
  if (selectedTimeEducation.value.time && selectedTimeEducation.value.school) {
    candidateForm.value.timeEducation[langKey].push({
      time: selectedTimeEducation.value.time,
      school: selectedTimeEducation.value.school
    });

    // Reset nếu muốn
    selectedTimeEducation.value.time = '';
    selectedTimeEducation.value.school = '';
  }
};

const addWorkExperience = () => { // Thêm item kinh nghệm làm việc và mảng
  const langKey = lang.value;

  // Đảm bảo timeEducation là một object
  if (!candidateForm.value.work_experience) {
    candidateForm.value.work_experience = {};
  }

  // Đảm bảo mảng theo langKey tồn tại
  if (!Array.isArray(candidateForm.value.work_experience[langKey])) {
    candidateForm.value.work_experience[langKey] = [];
  }

  

  // Kiểm tra dữ liệu đầu vào
  if (selectedWorkExperience.value.time && selectedWorkExperience.value.company) {
    candidateForm.value.work_experience[langKey].push({
      time: selectedWorkExperience.value.time,
      company: selectedWorkExperience.value.company,
      position: selectedWorkExperience.value.position,
      description: selectedWorkExperience.value.description
    });

    // Reset nếu muốn
    selectedWorkExperience.value.time = '';
    selectedWorkExperience.value.company = '';
    selectedWorkExperience.value.position = '';
    selectedWorkExperience.value.description = '';
  }

  console.log(candidateForm.value);
};

const addItemSkills = () => { // Thêm item kỹ năng vào mảng
  const langKey = lang.value;

  // Đảm bảo skills là một object
  if (!candidateForm.value.skills) {
    candidateForm.value.skills = {};
  }

  // Đảm bảo mảng theo langKey tồn tại
  if (!Array.isArray(candidateForm.value.skills[langKey])) {
    candidateForm.value.skills[langKey] = [];
  }

  // Kiểm tra dữ liệu đầu vào
  if (selectedSkills.value.name && selectedSkills.value.description) {
    candidateForm.value.skills[langKey].push({
      name: selectedSkills.value.name,
      description: selectedSkills.value.description
    });

    // Reset nếu muốn
    selectedSkills.value.name = '';
    selectedSkills.value.description = '';
  }
};

const currentIndustry = computed({ // Nhóm ngành nghề
  get() {
    return candidateForm.value.industry_id[lang.value] || []
  },
  set(newVal) {
    const selectedIds = newVal.map(i => i.id)
    const allIndustries = store.state.industries.industriesLang || {}
    // Duyệt qua tất cả ngôn ngữ và đồng bộ theo ID
    const synced = {}
    for (const locale in allIndustries) {
      const options = allIndustries[locale] || []
      synced[locale] = options.filter(opt => selectedIds.includes(opt.id))
    }
    candidateForm.value.industry_id = synced
  }
})

const currentEducation = computed({ // Học vấn
  get() {
    return candidateForm.value.education[lang.value] || {}
  },
  set(val) {
    candidateForm.value.education = {
      ...candidateForm.value.education,
      [lang.value]: val
    }
  }
})

const currentLanguage = computed({ // Ngoại ngữ
  get() {
    return candidateForm.value.language[lang.value] || {}
  },
  set(val) {
    candidateForm.value.language = {
      ...candidateForm.value.language,
      [lang.value]: val
    }
  }
})

const currentExperienceSummary = computed({ // Kinh nghiệm
  get() {
    return candidateForm.value.experience_summary[lang.value] || ''
  },
  set(val) {
    candidateForm.value.experience_summary = {
      ...candidateForm.value.experience_summary,
      [lang.value]: val
    }
  }
})

const currentStrength = computed({ // ĐiểM mạnh
  get() {
    return candidateForm.value.currentStrength[lang.value] || ''
  },
  set(val) {
    candidateForm.value.currentStrength = {
      ...candidateForm.value.currentStrength,
      [lang.value]: val
    }
  }
})

const getFileName = (url) => {
  try {
    return decodeURIComponent(url.split('/').pop())
  } catch {
    return url
  }
}

/* Cập nhật file */
const onFileChange = (event, field) => {
  const file = event.target.files[0]
  if (!file) return

  const langCode = lang.value

  // Khởi tạo structure nếu chưa có
  if (!candidateForm.value.file_cv) {
    candidateForm.value.file_cv = {}
  }

  if (!candidateForm.value.file_cv[langCode]) {
    candidateForm.value.file_cv[langCode] = {}
  }

  candidateForm.value.file_cv[langCode][field].file = file
  event.target.value = ''
}
/* END: Thêm ngôn ngữ */ 

// Danh sách jobs
const formFilter = reactive({
  keyword: '',
  industry_id: 0,
  created_by: 0,
  language: '', // Thêm vào formFilter
  desired_locations: [], // Thêm vào formFilter
})
watch(
  [formFilter],
  debounce(() => {
    fetchCandidates()
  }, 300)
)

watch(
  selectedIndustryId,
  debounce(() => {
    candidateForm.value.industry_id = selectedIndustryId.value
  }, 300)
)

/*START: Xoá bỏ các thông tin lọc */
const clearSelectedUserFilter = () => {
  selectedUserFilter.value = { id: 0, name: 'Người tạo' }
  formFilter.created_by = 0
}

const clearSelectedLanguageFilter = () => {
  selectedLanguageFilter.value = ''
  formFilter.language = ''
}
/*END: Xoá bỏ các thông tin lọc */

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
  const { phone, email } = candidateForm.value
  const candidate_id = selectedCandidate.value?.id || 0;
  if (!phone && !email) return // Không cần gọi nếu rỗng
  try {
    const res = await axiosInstance.get('candidates/check-exists', {
      params: { phone, email, candidate_id }
    })
    validationErrors.emailExists = res.data.email.status
    validationErrors.phoneExists = res.data.phone.status

    validationMessageErrors.phoneExists = res.data.phone.message
    validationMessageErrors.emailExists = res.data.email.message
  } catch (error) {
    console.error('Lỗi khi kiểm tra tồn tại:', error)
  }
}

// Debounce để tránh spam API
const debouncedCheck = debounce(() => {
  checkExists()
}, 500)

// Watch thay đổi phone & email
watch(
  () => [candidateForm.value.phone, candidateForm.value.email],
  debouncedCheck
)
/* END */

watch(selectedIndustryFilter, (newVal) => {
  formFilter.industry_id = newVal.map(i => i.id);
});

/* START: Thông tin gán Ứng viên cho Nhân viên */
const handleAssignUsers = async() => { // Gán các thành viên cho ứng viên
  try {
    const payload = {
      candidate_id: selectedCandidateId.value,
      users: selectedUsersAssign.value,
    }
    const res = await store.dispatch('candidates/assignCandidateToUser', payload)
    toastr.success(res.message)
  } catch (error) {
    console.log('Lỗi khi tạo: ', error)
  }
}

const handleSearchUser = debounce(async(query) => { // Tìm kiếm user
  try {
    const res = await axiosInstance.get('users/search', {
      params: { keyword: query },
    })
    usersAssign.value = res.data || []    
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  }
}, 300)

const openToggleAssignUserPopup = (candidateId) => { // Hiển thị Form
  const candidate = candidates.value.find((c) => c.id === candidateId)
  if (candidate) {
    selectedCandidateId.value = candidateId
    selectedCandidateFullName.value = `${candidate.code} - ${candidate.full_name}`
  }

  // Cập nhật nhân viên đã có
  if( candidate.users.length > 0 ) {
    selectedUsersAssign.value = candidate.users
  }

  toggleAssignUserPopup.value = true
}

const closeToggleAssignUserPopup = () => { // Đóng Form
  usersAssign.value = [];
  selectedUsersAssign.value = []
  toggleAssignUserPopup.value = false

  // Reset dữ liệu ứng viên selected
  selectedCandidateId.value = ''
  selectedCandidateFullName.value = ''
}
/* END */

const fetchCandidates = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      keyword: formFilter.keyword,
      industry_id: formFilter.industry_id,
      created_by: formFilter.created_by,
      language: formFilter.language, // Gửi bộ lọc ngoại ngữ
      desired_locations: formFilter.desired_locations, // Gửi bộ lọc khu vực mong
    }
    await store.dispatch('candidates/fetchCandidates', { page: currentPage.value, perPage: 20, params })
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error)
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const { data } = await axiosInstance.get('users/lists')
    users.value = data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách users:', error)
  }
}
const searchJobs = async (query) => {
  try {
    const { data } = await axiosInstance.get('jobs', {
      params: { keyword: query },
    })
    jobs.value = data.lists || []
  } catch (error) {
    console.error('Lỗi khi tìm kiếm jobs:', error)
    toastr.error('Không thể tìm kiếm jobs')
  }
}
const debouncedSearchJobs = debounce(async (query) => {
  if (!query) {
    jobs.value = []
    return
  }
  loadingJobs.value = true
  try {
    await searchJobs(query)
  } finally {
    loadingJobs.value = false
  }
}, 300)
const openAssignJobPopup = (candidateId) => {
  const candidate = candidates.value.find((c) => c.id === candidateId)
  if (candidate) {
    selectedCandidateId.value = candidateId
    selectedCandidateFullName.value = `${candidate.code} - ${candidate.full_name}`
    showAssignJobPopup.value = true
    jobs.value = [] // Reset danh sách jobs khi mở popup
  }
}
const closeAssignJobPopup = () => {
  showAssignJobPopup.value = false
  selectedCandidateId.value = null
  selectedCandidateFullName.value = ''
  selectedJob.value = null
}
const onJobChange = () => {
  // Cập nhật logic nếu cần khi chọn job
}

const assignJob = async () => {
  if (!selectedJob.value) {
    toastr.error('Vui lòng chọn một job để gán')
    return
  }
  loadingAssignJob.value = true
  try {
    const payload = {
      candidate_id: selectedCandidateId.value,
      job_id: selectedJob.value.id,
    }
    const response = await store.dispatch('candidateJobs/assignCandidateToJob', payload)
    toastr.success(response.data.message)
  } catch (error) {
    const errorMessage = error.error === 'duplicate_assignment' ? 'Ứng viên này đã được gán vào job order này trước đó!' : error.message || 'Có lỗi xảy ra!'
    Swal.fire('Lỗi!', errorMessage, 'error')
  } finally {
    loadingAssignJob.value = false
    closeAssignJobPopup()
  }
}
const showModal = () => {
  // Gán lại các danh sách giáo dục/ngành/ngôn ngữ mặc định
  educations.value = allEducations.value[lang.value]
  industries.value = allIndustries.value[lang.value]
  languages.value = allLanguages.value[lang.value]
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCandidate.value = null
  selectedEducation.value = null
  selectedLanguage.value = null
  selectedCurrentLocation.value = null
  selectedIndustryId.value = []
  candidateForm.value = {
    full_name: {},
    phone: '',
    email: '',
    avatar: {},
    industry_id: [],
    education: {},
    language: {},
    language_other: '',
    current_location: 0,
    desired_location: [],
    experience_summary: {},
    currentStrength: {},
    file_cv: {},
    cv_no_contact: null,
    cv_with_contact: null,
  }
}

const showCandidate = (id) => {
  selectedCandidateId.value = id
  isShowCandidate.value = true
}

const closeCandidateDetail = () => {
  isShowCandidate.value = false
  selectedCandidateId.value = null
}

const onIndustryChangeFilter = () => {
  formFilter.industry_id = selectedIndustryFilter.value?.id || 0
}

const onUserChangeFilter = (val) => {
  formFilter.created_by = selectedUserFilter.value?.id || 0
  if( val ){
    console.log(val)
  } else {
    console.log('Rỗng')
  }
}
const onLanguageChangeFilter = () => {
  formFilter.language = selectedLanguageFilter.value?.id || ''
}

const onDesiredLocationsChangeFilter = () => {
  formFilter.desired_locations = selectedDesiredLocationsFilter.value ? selectedDesiredLocationsFilter.value.map((loc) => loc.id) : []
}
const onIndustryIdChange = () => {
  candidateForm.value.industry_id = selectedIndustryId.value || []
}

const onDesiredLocationChange = () => {
  candidateForm.value.desired_location = selectedDesiredLocation.value ? selectedDesiredLocation.value.map((loc) => loc.id) : []
}

// const onEducationChange = () => {
//   candidateForm.value.education = selectedEducation.value?.id || ''
// }

// const onLanguageChange = () => {
//   candidateForm.value.language = selectedLanguage.value?.id || ''
// }

const onCurrentLocationChange = () => {
  candidateForm.value.current_location = selectedCurrentLocation.value?.id || 0
}

const deleteCandidate = async (id) => {
  const result = await Swal.fire({
    title: 'Bạn có chắc chắn muốn xóa ứng viên này?',
    text: 'Hành động này không thể hoàn tác!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy',
  })
  if (result.isConfirmed) {
    loading.value = true
    try {
      const data = await store.dispatch('candidates/deleteCandidate', id)
      Swal.fire({
        title: 'Thành công!',
        text: data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      })
    } catch (error) {
      Swal.fire({
        title: 'Lỗi!',
        text: error.message || 'Có lỗi xảy ra!',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    } finally {
      loading.value = false
    }
  }
}

// const onFileChange = (event, field) => {
//   candidateForm.value[field] = event.target.files[0]
// }

// Chỉnh sửa Bản Ghi
// const editCandidate = (candidate) => {
//   selectedCandidate.value = candidate
//   //selectedIndustryId.value = industries.value.find((c) => c.id == candidate.industry_id) || null
//   //selectedIndustryId.value = candidate.industry_id || []
//   //selectedIndustryId.value = candidate.industry_id[lang]?.map(item => item) || [];
//   //selectedEducation.value = educations.value.find((c) => c.id == candidate.education) || null
//   //selectedLanguage.value = languages.value.find((c) => c.id == candidate.language) || null
//   selectedCurrentLocation.value = provinces.value.find((c) => c.id == candidate.current_location) || null
//   // Lấy desired_locations từ quan hệ
//   const desiredLocationIds = candidate.desired_locations ? candidate.desired_locations.map((loc) => loc.location_id) : []
//   selectedDesiredLocation.value = provinces.value.filter((p) => desiredLocationIds.includes(p.id)) || []
//   candidateForm.value = { ...candidate, file_cv: cloneDeep(candidate.file_cv), cv_no_contact: null, cv_with_contact: null }
//   educations.value = allEducations.value.vi
//   industries.value = allIndustries.value.vi
//   languages.value = allLanguages.value.vi
//   // currentExperienceSummary.value = candidate.experience_summary.vi
//   showModal()
// }

const parseFromApi = (str) => {
  if (!str) return null
  const [y, m, d] = str.split('-')
  return new Date(y, m - 1, d)
}


const editCandidate = (candidate) => {
  selectedCandidate.value = candidate
  
  // Clone toàn bộ tránh đụng vào Vuex
  const clone = cloneDeep(candidate)

  selectedCurrentLocation.value = provinces.value.find(
    p => p.id === clone.current_location
  ) || null

  const fileCV = candidate.file_cv || {}
  const currentLangCV = fileCV[lang.value] || {}

  defaultAvatar.value = clone.avatar_url,
  currentBirthday.value = parseFromApi(clone.birthday)
  formattedBirthday.value = clone.birthday

  // Gán về form
  candidateForm.value = {
    id: clone.id || 0,
    full_name: clone.full_name || {},
    phone: clone.phone || '',
    email: clone.email || '',
    avatar: clone.avatar || {},
    gender: clone.gender || {},
    birthday: clone.birthday || '',
    industry_id: clone.industry_id || {},
    education: clone.education || {},
    language: clone.language || {},
    language_other: clone.language_other || '',
    current_location: clone.current_location || 0,
    desired_location: (clone.desired_locations || []).map(item => item.location_id),
    experience_summary: clone.experience_summary || {},
    currentStrength: clone.strength || {},
    timeEducation: clone.time_education || {},
    skills: clone.skills || {},
    work_experience: clone.work_experience || {},
    file_cv: clone.file_cv || {},
    cv_no_contact: currentLangCV.cv_no_contact || null, // 🔁 dùng để hiển thị tên
    cv_with_contact: currentLangCV.cv_with_contact || null,
  }

  // Gán location đã chọn
  const desiredLocationIds = candidate.desired_locations?.map(loc => loc.location_id) || []
  selectedDesiredLocation.value = provinces.value.filter(p => desiredLocationIds.includes(p.id)) || []

  // Gán lại các danh sách giáo dục/ngành/ngôn ngữ mặc định
  educations.value = allEducations.value[lang.value]
  industries.value = allIndustries.value[lang.value]
  languages.value = allLanguages.value[lang.value]

  showModal()
}

// Submit Form
const handleSubmit = async () => {
  loading.value = true
  try {
    const action = selectedCandidate.value ? 'candidates/updateCandidate' : 'candidates/addCandidate'
    //const industryIds = candidateForm.value.industry_id.map(item => item.id) || [];
    const formData = new FormData()
    formData.append('id', candidateForm.value.id || 0)
    formData.append('phone', candidateForm.value.phone || '');
    formData.append('birthday', formattedBirthday.value || '');
    formData.append('email', candidateForm.value.email || '');
    formData.append('language_other', candidateForm.value.language_other || '');
    formData.append('current_location', candidateForm.value.current_location || 0);
    formData.append('desired_location', JSON.stringify(candidateForm.value.desired_location || []));

    // Dạng object cần stringify lại
    formData.append('full_name', JSON.stringify(candidateForm.value.full_name));
    formData.append('industry_id', JSON.stringify(candidateForm.value.industry_id));
    formData.append('education', JSON.stringify(candidateForm.value.education));
    formData.append('language', JSON.stringify(candidateForm.value.language));
    formData.append('experience_summary', JSON.stringify(candidateForm.value.experience_summary));
    formData.append('currentStrength', JSON.stringify(candidateForm.value.currentStrength));
    formData.append('time_education', JSON.stringify(candidateForm.value.timeEducation));
    formData.append('skills', JSON.stringify(candidateForm.value.skills));
    formData.append('work_experience', JSON.stringify(candidateForm.value.work_experience));
    formData.append('gender', JSON.stringify(candidateForm.value.gender));


    // Thêm file cv
    Languages.value.forEach(lang => {
      const langCv = candidateForm.value.file_cv?.[lang.code]
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

    if( candidateForm.value.avatar && candidateForm.value.avatar instanceof File ){
      formData.append('avatar', candidateForm.value.avatar)
    }

    const data = await store.dispatch(action, formData)
    toastr.success(`${data.message}`)
    candidateForm.value = {
      full_name: {},
      phone: '',
      email: '',
      avatar: {},
      industry_id: [],
      education: {},
      language: {},
      language_other: '',
      current_location: 0,
      desired_location: [],
      experience_summary: {},
      currentStrength: {},
      file_cv: {},
      cv_no_contact: null,
      cv_with_contact: null,
    }
    selectedCandidate.value = null
    closeModal()
  } catch (error) {
    console.log(error)
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    store.dispatch('candidates/fetchProvinces'), 
    store.dispatch('candidates/fetchConfigCandidate'), 
    fetchCandidates(), 
    fetchUsers(),
    store.dispatch('industries/fetchIndustryListsLang'),
    store.dispatch('candidates/fetchConfigCandidate')
  ])
})
</script>
